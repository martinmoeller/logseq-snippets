import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

// Declare logseq global to avoid TS errors if types are not picked up globally
declare const logseq: any;

interface Snippet {
    trigger: string;
    replacement: string;
}

export async function registerReplacer() {
    const mainContentContainer = top?.document.getElementById('app-container');
    if (!mainContentContainer) {
        console.error('[Snippets] Could not find app-container');
        return;
    }

    mainContentContainer.addEventListener('keyup', async (e: any) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA') return;

        // We only care about Space or Enter for expansion trigger
        if (e.key !== ' ' && e.key !== 'Enter') return;

        // Get content directly from the textarea
        const content = (target as HTMLTextAreaElement).value;

        const currentBlock = await logseq.Editor.checkEditing();
        if (!currentBlock) return;

        await checkAndReplace(currentBlock as string, content);
    });
}

async function checkAndReplace(uuid: string, content: string) {
    const snippets = getSnippets();

    // We need to find a trigger at the end of the string.
    // The trigger is "keyword" + " " or "keyword" + "\n"
    // content ends with one of these.

    for (const { trigger, replacement } of snippets) {
        if (!trigger) continue;

        // We use a regex to ensure we match the trigger as a whole word boundary if possible, 
        // but typically we just check if it ends with " trigger "
        // Regex: /(?:^|\s)trigger\s$/ (preceded by start or space, followed by space at end)
        // But simplified check: content ends with ` ${trigger} ` or just starts with `${trigger} `
        // or simply: does it end with `${trigger} `?

        // User requirement: "Ersetzung nur am Wortende triggert (Regex: \bshortcut\s$)"
        // \b matches word boundary.

        // We construct regex dynamically. Escape trigger first?
        const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedTrigger}\\s$`); // \s matches space/newline

        // Test if content matches
        if (regex.test(content)) {
            // Calculate new content
            // We replace the match. 
            // We need to know the length of the match to slice correctly.
            // The match is " trigger " (with leading boundary?) No, \b matches position.
            // So it matches "trigger " at the end.

            // Wait, \s matches the last char.
            // If content is "foo bar ", regex matches "bar "

            // We want to replace "trigger " with "replacement ".
            // Note: we might want to keep the trailing space/newline?
            // Usually text expansion keeps the delimiter.
            // User said: "Füge stattdessen den Erweiterungstext an der Cursor-Position ein"

            // Let's replace the triggered part.
            // content "hello gh " -> "hello GitHub "

            // We execute regex to get match details if needed, or just slice.
            // Since we know it ends with trigger + space, and \b ensures it's a word.

            const triggerLen = trigger.length + 1; // +1 for the space/newline char

            // Check if the last char is actually what we think (could be \n or space)
            const lastChar = content.slice(-1);

            const newText = content.slice(0, -triggerLen) + replacement + lastChar;

            await logseq.Editor.updateBlock(uuid, newText);
            return; // Stop after first match
        }
    }
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
