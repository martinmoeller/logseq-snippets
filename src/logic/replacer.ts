import '@logseq/libs';
import {
    enterMode,
    expandKeys,
    isCaseSensitive,
    matchCase,
    notifyMode,
    triggerPrefix,
} from '../settings';
import {
    detectCasing,
    expand,
    getSnippets,
    needsClipboard,
    readClipboard,
    Snippet,
} from './snippets';

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const URL_TOKEN = /(^|\s)([a-z][\w+.-]*:\/\/|www\.)\S*$/i;
// Logseq editor popups (autocomplete, slash commands, date picker) that own the Enter key
const POPUP_SELECTOR = '#ui__ac, .absolute-modal, [data-editor-popup-ref], .ui__popover-content';

interface Match {
    snippet: Snippet;
    start: number; // index where the trigger starts
    typed: string; // prefix + trigger as actually typed (original case)
    prefixLength: number;
    suffix: string; // character typed after the trigger ('' for Enter/Tab)
}

/** The last expansion, so Backspace can revert it. */
interface Expansion {
    ta: HTMLTextAreaElement;
    start: number;
    inserted: string;
    original: string;
    caret: number;
}

let applying = false;
let last: Expansion | null = null;
let suppressed: { ta: HTMLTextAreaElement; start: number } | null = null;

const hostDoc = () => top?.document ?? document;

const popupOpen = () =>
    Array.from(hostDoc().querySelectorAll<HTMLElement>(POPUP_SELECTOR)).some(
        el => el.getClientRects().length > 0
    );

function asTextarea(target: EventTarget | null): HTMLTextAreaElement | null {
    return (target as Element | null)?.tagName === 'TEXTAREA'
        ? (target as HTMLTextAreaElement)
        : null;
}

/** True if the position is inside code, a link or a Logseq reference, where nothing should expand. */
function inProtectedContext(before: string): boolean {
    const fences = before.split('```').length - 1;
    if (fences % 2) return true;
    const outsideFences = before.split('```').pop()!;
    if ((outsideFences.split('`').length - 1) % 2) return true;

    for (const [open, close] of [
        ['[[', ']]'],
        ['((', '))'],
        ['{{', '}}'],
    ]) {
        if (before.lastIndexOf(open) > before.lastIndexOf(close)) return true;
    }
    return URL_TOKEN.test(before);
}

function findMatch(ta: HTMLTextAreaElement, suffix: string): Match | null {
    if (ta.selectionStart !== ta.selectionEnd) return null;
    const before = ta.value.slice(0, ta.selectionEnd);
    if (!before.endsWith(suffix)) return null;

    const body = before.slice(0, before.length - suffix.length);
    const cs = isCaseSensitive();
    const fold = (s: string) => (cs ? s : s.toLowerCase());
    const haystack = fold(body);
    const prefix = triggerPrefix();

    for (const snippet of getSnippets()) {
        if (!snippet.trigger) continue;
        const trigger = fold(prefix + snippet.trigger);
        if (!haystack.endsWith(trigger)) continue;

        const start = body.length - trigger.length;
        // Don't expand inside a word, e.g. "ogh" must not trigger "gh" (nor "o;gh" with prefix ";")
        const wordBefore = start > 0 && WORD_CHAR.test(body[start - 1]);
        if (wordBefore && (prefix || WORD_CHAR.test(trigger[0]))) continue;
        if (suppressed?.ta === ta && suppressed.start === start) return null;
        if (inProtectedContext(body.slice(0, start))) return null;

        return { snippet, start, typed: body.slice(start), prefixLength: prefix.length, suffix };
    }
    return null;
}

/**
 * Replaces [start, end) through the browser's editing pipeline: synchronous, fires a
 * regular `input` event for Logseq, and keeps the native undo stack intact.
 */
function replaceRange(ta: HTMLTextAreaElement, start: number, end: number, text: string) {
    applying = true;
    try {
        ta.focus();
        ta.setSelectionRange(start, end);
        if (!ta.ownerDocument.execCommand('insertText', false, text)) {
            ta.setRangeText(text, start, end, 'end');
            ta.dispatchEvent(
                new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })
            );
        }
    } finally {
        applying = false;
    }
}

/** Expands the match in place. `caretAtEnd` ignores {cursor}, e.g. when Enter moves on to a new block. */
function apply(ta: HTMLTextAreaElement, match: Match, clipboard?: string, caretAtEnd = false) {
    const { snippet, start, typed, prefixLength, suffix } = match;
    const end = start + typed.length;

    // Async path ({clipboard}): make sure the trigger is still where we found it
    if (ta.value.slice(start, end) !== typed) return;

    const caretBefore = ta.selectionEnd;
    const casing = matchCase() ? detectCasing(typed.slice(prefixLength), snippet.trigger) : null;
    const { text, cursor } = expand(snippet.replacement, clipboard, casing);
    replaceRange(ta, start, end, text);

    // Keystrokes typed while the clipboard was read are kept; only move the caret if none were
    const untouched = caretBefore === end + suffix.length;
    const caret = untouched
        ? start + ((caretAtEnd ? null : cursor) ?? text.length + suffix.length)
        : caretBefore + text.length - typed.length;
    ta.setSelectionRange(caret, caret);

    last = { ta, start, inserted: text + suffix, original: typed + suffix, caret };
    suppressed = null;
    notify('success', `Snippet expanded: ${snippet.trigger}`);
}

function expandMatch(ta: HTMLTextAreaElement, match: Match) {
    try {
        if (!needsClipboard(match.snippet.replacement)) return apply(ta, match);
        readClipboard()
            .then(clip => apply(ta, match, clip))
            .catch(onError);
    } catch (error) {
        onError(error);
    }
}

/** Enter in "new block" mode: expand, then let Logseq handle Enter as usual. */
function expandThenNewBlock(e: KeyboardEvent, ta: HTMLTextAreaElement, match: Match) {
    if (!needsClipboard(match.snippet.replacement)) {
        try {
            apply(ta, match, undefined, true); // synchronous, so Logseq's Enter handler sees the result
        } catch (error) {
            onError(error);
        }
        return;
    }
    // The clipboard is async, so Logseq's Enter can't wait for it: create the block ourselves
    e.preventDefault();
    e.stopPropagation();
    readClipboard()
        .then(async clip => {
            apply(ta, match, clip, true);
            const uuid = await logseq.Editor.checkEditing();
            if (typeof uuid === 'string')
                await logseq.Editor.insertBlock(uuid, '', { sibling: true, focus: true });
        })
        .catch(onError);
}

/** Backspace directly after an expansion restores the typed trigger. */
function revertLast(ta: HTMLTextAreaElement): boolean {
    const exp = last;
    last = null;
    if (!exp || exp.ta !== ta || ta.selectionStart !== exp.caret || ta.selectionEnd !== exp.caret)
        return false;
    const end = exp.start + exp.inserted.length;
    if (ta.value.slice(exp.start, end) !== exp.inserted) return false;

    replaceRange(ta, exp.start, end, exp.original);
    suppressed = { ta, start: exp.start };
    return true;
}

function onKeydown(e: KeyboardEvent) {
    const ta = asTextarea(e.target);
    if (!ta || e.isComposing) return;

    if (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (revertLast(ta)) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            suppressed = null; // the user is editing the trigger again
        }
        return;
    }
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) last = null;

    const mods = e.ctrlKey || e.metaKey || e.altKey;
    const isEnter = e.key === 'Enter' && !mods && enterMode() !== 'never';
    const isTab = e.key === 'Tab' && !mods && !e.shiftKey && expandKeys().tab;
    if ((!isEnter && !isTab) || popupOpen()) return;

    const match = findMatch(ta, '');
    if (!match) return;
    if (isEnter && enterMode() === 'newBlock') return expandThenNewBlock(e, ta, match);
    e.preventDefault();
    e.stopPropagation();
    expandMatch(ta, match);
}

function onInput(e: Event) {
    const { data, target, inputType, isComposing } = e as InputEvent;
    if (applying || isComposing || inputType !== 'insertText' || !data) return;
    if (!expandKeys().chars.has(data)) return;
    const ta = asTextarea(target);
    const match = ta && findMatch(ta, data);
    if (match) expandMatch(ta, match);
}

function onFocusOut() {
    last = null;
    suppressed = null;
}

export function registerReplacer() {
    unregisterReplacer();
    hostDoc().addEventListener('keydown', onKeydown, true);
    hostDoc().addEventListener('input', onInput, true);
    hostDoc().addEventListener('focusout', onFocusOut, true);
}

export function unregisterReplacer() {
    hostDoc().removeEventListener('keydown', onKeydown, true);
    hostDoc().removeEventListener('input', onInput, true);
    hostDoc().removeEventListener('focusout', onFocusOut, true);
}

function onError(error: unknown) {
    console.error('Error expanding snippet:', error);
    notify('error', 'Failed to expand snippet');
}

function notify(type: 'success' | 'error', message: string) {
    const mode = notifyMode();
    if (mode === 'never' || (type === 'success' && mode !== 'always')) return;
    logseq.UI.showMsg(message, type, { timeout: type === 'error' ? 3000 : 1500 });
}
