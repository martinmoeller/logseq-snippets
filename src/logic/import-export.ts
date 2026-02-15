import '@logseq/libs';

export async function exportSnippets() {
    try {
        const snippets = String(logseq.settings?.['snippets'] || '');
        const blob = new Blob([snippets], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `logseq-snippets-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logseq.UI.showMsg('Snippets exported successfully', 'success');
    } catch (error) {
        console.error('Failed to export snippets:', error);
        logseq.UI.showMsg('Failed to export snippets', 'error');
    }
}

export async function importSnippets() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.json';

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event: ProgressEvent<FileReader>) => {
                const content = event.target?.result as string;
                if (!content) return;

                try {
                    // Validate the content
                    const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
                    const validLines = lines.filter(l => l.includes(';;'));

                    if (validLines.length === 0) {
                        logseq.UI.showMsg('No valid snippets found in file', 'warning');
                        return;
                    }

                    // Ask user if they want to replace or append
                    const replace = await logseq.UI.showMsg(
                        `Found ${validLines.length} snippets. Replace existing snippets?`,
                        'warning',
                        { timeout: 0 }
                    );

                    const currentSnippets = String(logseq.settings?.['snippets'] || '');
                    let newSnippets = content;

                    if (!replace && currentSnippets) {
                        newSnippets = currentSnippets + '\n' + content;
                    }

                    await logseq.updateSettings({ snippets: newSnippets });
                    logseq.UI.showMsg(`Imported ${validLines.length} snippets`, 'success');
                } catch (error) {
                    console.error('Failed to import snippets:', error);
                    logseq.UI.showMsg('Failed to import snippets', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    } catch (error) {
        console.error('Failed to import snippets:', error);
        logseq.UI.showMsg('Failed to import snippets', 'error');
    }
}
