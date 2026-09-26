import '@logseq/libs';
import { isCaseSensitive } from '../settings';

export interface Snippet {
    trigger: string;
    replacement: string;
}

export const VARIABLES = ['{date}', '{time}', '{datetime}', '{clipboard}', '{cursor}'] as const;
const CURSOR_MARKERS = ['{{cursor}}', '[[cursor]]', '{cursor}'];
const CURSOR = String.fromCharCode(0xe000); // private-use placeholder, survives case changes

export type Casing = 'upper' | 'capitalize' | null;

let cache: { key: string; snippets: Snippet[] } | null = null;

/** Parses the "trigger ;; replacement" format (plus legacy JSON arrays). */
export function parseSnippets(raw: unknown): Snippet[] {
    if (Array.isArray(raw)) return raw as Snippet[];
    if (typeof raw !== 'string') return [];

    const snippets: Snippet[] = [];
    for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const sep = trimmed.indexOf(';;');
        if (sep < 0) continue;
        const trigger = trimmed.slice(0, sep).trim();
        const replacement = trimmed
            .slice(sep + 2)
            .trim()
            .replace(/\\n/g, '\n');
        if (trigger && replacement) snippets.push({ trigger, replacement });
    }

    if (!snippets.length && raw.trim().startsWith('[')) {
        try {
            const json = JSON.parse(raw);
            if (Array.isArray(json)) return json;
        } catch {
            /* not JSON */
        }
    }
    return snippets;
}

export function serializeSnippets(snippets: Snippet[]): string {
    return snippets
        .filter(s => s.trigger.trim() && s.replacement.trim())
        .map(s => `${s.trigger.trim()} ;; ${s.replacement.replace(/\r?\n/g, '\\n')}`)
        .join('\n');
}

export function loadSnippets(): Snippet[] {
    return parseSnippets(logseq.settings?.['snippets']);
}

export async function saveSnippets(snippets: Snippet[]) {
    await logseq.updateSettings({ snippets: serializeSnippets(snippets) });
}

/** Snippets for matching: cached, longest trigger first so the most specific one wins. */
export function getSnippets(): Snippet[] {
    const raw = logseq.settings?.['snippets'];
    const key = (typeof raw === 'string' ? raw : JSON.stringify(raw)) + isCaseSensitive();
    if (cache?.key !== key) {
        const snippets = parseSnippets(raw).sort((a, b) => b.trigger.length - a.trigger.length);
        cache = { key, snippets };
    }
    return cache.snippets;
}

export function normalizeTrigger(trigger: string) {
    return isCaseSensitive() ? trigger : trigger.toLowerCase();
}

const pad = (n: number) => String(n).padStart(2, '0');

export const needsClipboard = (template: string) => template.includes('{clipboard}');

/** Reads the clipboard via the host window (the plugin iframe usually has no focus). */
export async function readClipboard(): Promise<string> {
    try {
        return await (top ?? window).navigator.clipboard.readText();
    } catch (error) {
        console.warn('Failed to read clipboard:', error);
        return '';
    }
}

/** How the typed trigger deviates from the defined one: "GM" → upper, "Gm" → capitalize. */
export function detectCasing(typed: string, trigger: string): Casing {
    if (typed === trigger) return null;
    const letters = typed.replace(/\P{L}/gu, '');
    if (!letters || letters === letters.toLowerCase()) return null;
    if (letters.length > 1 && letters === letters.toUpperCase()) return 'upper';
    const first = trigger.match(/\p{L}/u)?.[0];
    return first && first === first.toLowerCase() && letters[0] !== letters[0].toLowerCase()
        ? 'capitalize'
        : null;
}

/** Expands variables and returns the text plus the cursor offset (if a cursor marker was used). */
export function expand(
    template: string,
    clipboard = '',
    casing: Casing = null
): { text: string; cursor: number | null } {
    const now = new Date();
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    let text = template
        .replace(/\{datetime\}/g, `${date} ${time}`)
        .replace(/\{date\}/g, date)
        .replace(/\{time\}/g, time)
        .replace(/\{clipboard\}/g, () => clipboard);

    for (const marker of CURSOR_MARKERS) text = text.split(marker).join(CURSOR);
    if (casing === 'upper') text = text.toUpperCase();
    if (casing === 'capitalize') text = text.replace(/\p{L}/u, c => c.toUpperCase());

    const idx = text.indexOf(CURSOR);
    return { text: text.split(CURSOR).join(''), cursor: idx < 0 ? null : idx };
}
