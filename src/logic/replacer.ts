import '@logseq/libs';

interface Snippet {
    trigger: string;
    replacement: string;
}

interface SnippetCache {
    snippets: Snippet[];
    rawSettings: string;
}

let snippetCache: SnippetCache | null = null;
let eventListenersRegistered = false;
let keydownHandler: ((e: Event) => void) | null = null;
let inputHandler: ((e: Event) => void) | null = null;

export async function registerReplacer() {
    const doc = top?.document || document;
    if (!doc) {
        return;
    }

    // Clean up existing listeners if already registered
    if (eventListenersRegistered) {
        unregisterReplacer();
    }

    // Handle Enter on keydown (Capture Phase)
    keydownHandler = async (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        const target = keyEvent.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') return;

        if (keyEvent.key === 'Enter') {
            const content = (target as HTMLTextAreaElement).value;
            const snippets = getSnippets();

            const match = snippets.find(s => content.endsWith(s.trigger));
            if (match) {
                await handleEnter(keyEvent, target as HTMLTextAreaElement);
            }
        }
    };

    // Handle punctuation/space on 'input' event (Capture Phase)
    // 'input' fires when value changes. e.data contains the inserted char.
    inputHandler = async (e: Event) => {
        const inputEvent = e as InputEvent;
        const target = inputEvent.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') return;

        const char = inputEvent.data;
        if (!char) return; // e.g. deleteContentBackward

        if ([' ', ',', '.', ';'].includes(char)) {
            await handlePunctuation(char, target as HTMLTextAreaElement);
        }
    };

    doc.addEventListener('keydown', keydownHandler, { capture: true });
    doc.addEventListener('input', inputHandler, { capture: true });
    eventListenersRegistered = true;
}

export function unregisterReplacer() {
    const doc = top?.document || document;
    if (!doc) return;

    if (keydownHandler) {
        doc.removeEventListener('keydown', keydownHandler, { capture: true });
        keydownHandler = null;
    }

    if (inputHandler) {
        doc.removeEventListener('input', inputHandler, { capture: true });
        inputHandler = null;
    }

    eventListenersRegistered = false;
    snippetCache = null;
}

async function handleEnter(e: KeyboardEvent, target: HTMLTextAreaElement) {
    const content = target.value;
    const snippets = getSnippets();
    const caseSensitive = Boolean(logseq.settings?.['caseSensitive']);

    for (const { trigger, replacement } of snippets) {
        if (!trigger) continue;

        const matches = caseSensitive
            ? content.endsWith(trigger)
            : content.toLowerCase().endsWith(trigger.toLowerCase());

        if (matches) {
            const boundaryCheck = checkBoundary(content, trigger, 0, caseSensitive);
            if (boundaryCheck) {
                e.preventDefault();
                e.stopPropagation();

                try {
                    const currentBlock = await logseq.Editor.checkEditing();
                    if (!currentBlock) return;
                    const uuid = typeof currentBlock === 'string' ? currentBlock : (currentBlock as any).uuid;

                    const processedReplacement = await processVariables(replacement);
                    const newText = content.slice(0, -trigger.length) + processedReplacement;

                    await logseq.Editor.updateBlock(uuid, newText);

                    // Handle cursor positioning
                    await handleCursorPosition(uuid, processedReplacement);

                    // Show notification based on settings
                    showNotification('success', `Snippet expanded: ${trigger}`);
                } catch (error) {
                    console.error('Error expanding snippet:', error);
                    showNotification('error', 'Failed to expand snippet');
                }
                return;
            }
        }
    }
}

async function handlePunctuation(char: string, target: HTMLTextAreaElement) {
    const content = target.value;
    const snippets = getSnippets();
    const key = char;
    const caseSensitive = Boolean(logseq.settings?.['caseSensitive']);

    for (const { trigger, replacement } of snippets) {
        if (!trigger) continue;

        const suffix = trigger + key;
        const matches = caseSensitive
            ? content.endsWith(suffix)
            : content.toLowerCase().endsWith(suffix.toLowerCase());

        if (matches) {
            const boundaryCheck = checkBoundary(content, trigger, key.length, caseSensitive);
            if (boundaryCheck) {
                try {
                    const currentBlock = await logseq.Editor.checkEditing();
                    if (!currentBlock) return;
                    const uuid = typeof currentBlock === 'string' ? currentBlock : (currentBlock as any).uuid;

                    const processedReplacement = await processVariables(replacement);
                    const triggerLen = trigger.length + key.length;
                    const newText = content.slice(0, -triggerLen) + processedReplacement + key;

                    await logseq.Editor.updateBlock(uuid, newText);

                    // Handle cursor positioning
                    await handleCursorPosition(uuid, processedReplacement);

                    // Show notification based on settings
                    showNotification('success', `Snippet expanded: ${trigger}`);
                } catch (error) {
                    console.error('Error expanding snippet:', error);
                    showNotification('error', 'Failed to expand snippet');
                }
                return;
            }
        }
    }
}

function checkBoundary(content: string, trigger: string, offsetFromEnd: number, caseSensitive: boolean): boolean {
    const triggerStart = content.length - offsetFromEnd - trigger.length;
    if (triggerStart <= 0) return true; // Start of line

    const charBefore = content[triggerStart - 1];
    const actualTrigger = caseSensitive ? trigger : content.slice(triggerStart, content.length - offsetFromEnd);
    const triggerFirst = actualTrigger[0];

    // If both are word characters, it means we are inside a word -> no match
    if (triggerFirst && isWordChar(triggerFirst) && isWordChar(charBefore)) {
        return false;
    }
    return true;
}

function isWordChar(char: string): boolean {
    // Support Unicode word characters
    return /[\p{L}\p{N}_]/u.test(char);
}

async function processVariables(text: string): Promise<string> {
    let result = text;

    // {date} - Current date in YYYY-MM-DD format
    if (result.includes('{date}')) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        result = result.replace(/{date}/g, dateStr);
    }

    // {time} - Current time in HH:MM format
    if (result.includes('{time}')) {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);
        result = result.replace(/{time}/g, timeStr);
    }

    // {datetime} - Current date and time
    if (result.includes('{datetime}')) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5);
        result = result.replace(/{datetime}/g, `${dateStr} ${timeStr}`);
    }

    // {clipboard} - Clipboard content
    if (result.includes('{clipboard}')) {
        try {
            const clipboardText = await navigator.clipboard.readText();
            result = result.replace(/{clipboard}/g, clipboardText);
        } catch (error) {
            console.warn('Failed to read clipboard:', error);
            result = result.replace(/{clipboard}/g, '');
        }
    }

    return result;
}

async function handleCursorPosition(uuid: string, replacement: string) {
    // Look for cursor markers: {cursor}, {{cursor}}, or [[cursor]]
    const cursorMarkers = ['{cursor}', '{{cursor}}', '[[cursor]]'];

    for (const marker of cursorMarkers) {
        if (replacement.includes(marker)) {
            // Wait a bit for the block to update
            setTimeout(async () => {
                try {
                    await logseq.Editor.editBlock(uuid);
                    // The cursor will be at the end, we can't move it precisely in Logseq
                    // but at least we re-enter edit mode
                } catch (error) {
                    console.error('Failed to position cursor:', error);
                }
            }, 50);
            return;
        }
    }
}

function getSnippets(): Snippet[] {
    const settings = logseq.settings?.['snippets'];
    if (!settings) return [];

    // Use cache if settings haven't changed
    if (snippetCache && snippetCache.rawSettings === settings) {
        return snippetCache.snippets;
    }

    let snippets: Snippet[] = [];

    // Handle the new string format "trigger ;; replacement"
    if (typeof settings === 'string') {
        const lines = settings.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) continue; // Skip empty lines and comments

            const parts = line.split(';;');
            if (parts.length >= 2) {
                const trigger = parts[0].trim();
                let replacement = parts.slice(1).join(';;').trim(); // Join back in case replacement contains ';;'

                // Support multi-line with \n
                replacement = replacement.replace(/\\n/g, '\n');

                if (trigger && replacement) {
                    snippets.push({ trigger, replacement });
                }
            }
        }

        // Also try to parse as JSON for backward compatibility
        if (snippets.length === 0 && settings.trim().startsWith('[')) {
            try {
                const jsonSnippets = JSON.parse(settings);
                if (Array.isArray(jsonSnippets)) {
                    snippets = jsonSnippets;
                }
            } catch (e) {
                // Not JSON or invalid
            }
        }
    }

    // Fallback for existing array setting if not yet migrated
    if (Array.isArray(settings)) {
        snippets = settings as Snippet[];
    }

    // Validate for duplicate triggers
    const seen = new Set<string>();
    const duplicates: string[] = [];
    const caseSensitive = Boolean(logseq.settings?.['caseSensitive']);
    for (const snippet of snippets) {
        const key = caseSensitive ? snippet.trigger : snippet.trigger.toLowerCase();
        if (seen.has(key)) {
            duplicates.push(snippet.trigger);
        }
        seen.add(key);
    }

    if (duplicates.length > 0 && logseq.settings?.['warnDuplicates'] !== false) {
        console.warn('Duplicate snippet triggers found:', duplicates);
    }

    // Update cache
    snippetCache = {
        rawSettings: typeof settings === 'string' ? settings : JSON.stringify(settings),
        snippets
    };

    return snippets;
}

function showNotification(type: 'success' | 'error', message: string) {
    const notificationSetting = logseq.settings?.['showNotifications'] || 'always';

    // Show error notifications if setting is 'always' or 'errors-only'
    if (type === 'error' && (notificationSetting === 'always' || notificationSetting === 'errors-only')) {
        logseq.UI.showMsg(message, 'error', { timeout: 3000 });
        return;
    }

    // Show success notifications only if setting is 'always'
    if (type === 'success' && notificationSetting === 'always') {
        logseq.UI.showMsg(message, 'success', { timeout: 1500 });
        return;
    }

    // 'never' setting - don't show any notifications
}
