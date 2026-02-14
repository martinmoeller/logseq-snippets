import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { registerReplacer } from './logic/replacer';

const settingsSchema: SettingSchemaDesc[] = [
    {
        key: 'snippets',
        type: 'string',
        default: '',
        title: 'Snippets',
        description: 'Define your snippets here, one per line. Format: trigger ;; replacement\nExample:\ngh ;; GitHub\ngm ;; Good Morning',
        inputAs: 'textarea',
    },
];

function main() {
    console.log('Logseq Snippets plugin loaded');

    logseq.useSettingsSchema(settingsSchema);

    registerReplacer();
}

logseq.ready(main).catch(console.error);
