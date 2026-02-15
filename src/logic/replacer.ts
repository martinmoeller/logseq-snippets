import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

// Declare logseq global to avoid TS errors if types are not picked up globally
declare const logseq: any;

interface Snippet {
    trigger: string;
    replacement: string;
}

export async function registerReplacer() {
    const doc = top?.document || document;
    if (!doc) {
        return;
    }

    // Handle Enter on keydown (Capture Phase)
    doc.addEventListener('keydown', async (e: any) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') return;

        if (e.key === 'Enter') {
            // Debug: Show if content ends with any trigger
            const content = (target as HTMLTextAreaElement).value;

            const snippets = getSnippets();

            const match = snippets.find(s => content.endsWith(s.trigger));
            if (match) {
                await handleEnter(e, target as HTMLTextAreaElement);
            }
        }
    }, { capture: true });

    // Handle punctuation/space on 'input' event (Capture Phase)
    // 'input' fires when value changes. e.data contains the inserted char.
    doc.addEventListener('input', async (e: any) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') return;

        const char = e.data;
        if (!char) return; // e.g. deleteContentBackward

        if ([' ', ',', '.', ';'].includes(char)) {
            await handlePunctuation(char, target as HTMLTextAreaElement);
        }
    }, { capture: true });
}

async function handleEnter(e: any, target: HTMLTextAreaElement) {
    const content = target.value;
    const snippets = getSnippets();

    for (const { trigger, replacement } of snippets) {
        if (!trigger) continue;

        if (content.endsWith(trigger)) {
            const boundaryCheck = checkBoundary(content, trigger, 0);
            if (boundaryCheck) {
                e.preventDefault();
                e.stopPropagation();

                const currentBlock = await logseq.Editor.checkEditing();
                if (!currentBlock) return;
                const uuid = typeof currentBlock === 'string' ? currentBlock : currentBlock.uuid;

                const newText = content.slice(0, -trigger.length) + replacement;
                await logseq.Editor.updateBlock(uuid, newText);
                return;
            }
        }
    }
}

async function handlePunctuation(char: string, target: HTMLTextAreaElement) {
    const content = target.value;
    const snippets = getSnippets();
    const key = char;

    for (const { trigger, replacement } of snippets) {
        if (!trigger) continue;

        const suffix = trigger + key;
        if (content.endsWith(suffix)) {
            const boundaryCheck = checkBoundary(content, trigger, key.length);
            if (boundaryCheck) {
                const currentBlock = await logseq.Editor.checkEditing();
                if (!currentBlock) return;
                const uuid = typeof currentBlock === 'string' ? currentBlock : currentBlock.uuid;

                const triggerLen = trigger.length + key.length;
                const newText = content.slice(0, -triggerLen) + replacement + key;
                await logseq.Editor.updateBlock(uuid, newText);
                return;
            }
        }
    }
}

function checkBoundary(content: string, trigger: string, offsetFromEnd: number): boolean {
    const triggerStart = content.length - offsetFromEnd - trigger.length;
    if (triggerStart <= 0) return true; // Start of line

    const charBefore = content[triggerStart - 1];
    const triggerFirst = trigger[0];

    // If both are word characters, it means we are inside a word -> no match
    if (isWordChar(triggerFirst) && isWordChar(charBefore)) {
        return false;
    }
    return true;
}

function isWordChar(char: string) {
    return /^[a-zA-Z0-9_]$/.test(char);
}

function getSnippets(): Snippet[] {
    const settings = logseq.settings?.['snippets'];
    if (!settings) return [];

    // Handle the new string format "trigger ;; replacement"
    if (typeof settings === 'string') {
        const lines = settings.split('\n');
        const snippets: Snippet[] = [];

        for (const line of lines) {
            const parts = line.split(';;');
            if (parts.length >= 2) {
                const trigger = parts[0].trim();
                const replacement = parts.slice(1).join(';;').trim(); // Join back in case replacement contains ';;'
                if (trigger && replacement) {
                    snippets.push({ trigger, replacement });
                }
            }
        }

        // Also try to parse as JSON for backward compatibility / migration case if it looks like JSON?
        // Actually, let's keep it simple. If it parses as JSON array, we can support it, but
        // the string input from textarea will be a raw string.
        // Users might paste JSON into the textarea.
        if (snippets.length === 0 && settings.trim().startsWith('[')) {
            try {
                const jsonSnippets = JSON.parse(settings);
                if (Array.isArray(jsonSnippets)) return jsonSnippets;
            } catch (e) {
                // Not JSON or invalid
            }
        }

        return snippets;
    }

    // Fallback for existing array setting if not yet migrated (Logseq might keep the old value type in DB)
    if (Array.isArray(settings)) {
        return settings as Snippet[];
    }

    return [];
}
