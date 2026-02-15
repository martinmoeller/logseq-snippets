import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { registerReplacer, unregisterReplacer } from './logic/replacer';
import { exportSnippets, importSnippets } from './logic/import-export';

const settingsSchema: SettingSchemaDesc[] = [
    {
        key: 'snippets',
        type: 'string',
        default: '# Example snippets - remove these and add your own\ngh ;; GitHub\ngm ;; Good Morning\ntoday ;; {date}\nnow ;; {datetime}\n# Use \\n for multi-line snippets\nmeeting ;; ## Meeting Notes\\n- Date: {date}\\n- Attendees: \\n- Topics: ',
        title: 'Snippets',
        description: `Define your snippets here, one per line.
Format: trigger ;; replacement

Features:
- Use # for comments
- Multi-line: Use \\n in replacement text
- Variables: {date}, {time}, {datetime}, {clipboard}
- Cursor: Use {cursor} to mark cursor position

Examples:
gh ;; GitHub
today ;; {date}
meeting ;; ## Meeting\\n- Date: {date}`,
        inputAs: 'textarea',
    },
    {
        key: 'caseSensitive',
        type: 'boolean',
        default: false,
        title: 'Case Sensitive',
        description: 'Make snippet triggers case-sensitive (default: off)',
    },
    {
        key: 'showNotifications',
        type: 'enum',
        default: 'always',
        title: 'Show Expansion Notifications',
        description: 'Control when to show notifications after snippet expansion',
        enumChoices: ['always', 'never', 'errors-only'],
        enumPicker: 'radio',
    },
    {
        key: 'warnDuplicates',
        type: 'boolean',
        default: true,
        title: 'Warn About Duplicates',
        description: 'Show console warnings for duplicate triggers (default: on)',
    },
];

function main() {
    console.log('Logseq Snippets plugin loaded');

    logseq.useSettingsSchema(settingsSchema);

    // Register toolbar buttons for import/export
    logseq.App.registerUIItem('toolbar', {
        key: 'logseq-snippets-export',
        template: `
            <a class="button" data-on-click="exportSnippets" title="Export Snippets">
                <i class="ti ti-file-export"></i>
            </a>
        `,
    });

    logseq.App.registerUIItem('toolbar', {
        key: 'logseq-snippets-import',
        template: `
            <a class="button" data-on-click="importSnippets" title="Import Snippets">
                <i class="ti ti-file-import"></i>
            </a>
        `,
    });

    // Register event handlers
    logseq.on('ui:visible:changed', ({ visible }) => {
        if (visible) {
            registerReplacer();
        }
    });

    // Handle settings changes to refresh cache
    logseq.onSettingsChanged(() => {
        console.log('Settings changed, refreshing snippet cache');
        unregisterReplacer();
        registerReplacer();
    });

    // Register model callbacks
    logseq.provideModel({
        exportSnippets,
        importSnippets,
    });

    registerReplacer();
}

// Cleanup on unload
logseq.beforeunload(async () => {
    unregisterReplacer();
});

logseq.ready(main).catch(console.error);
