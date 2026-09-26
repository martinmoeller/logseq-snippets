import '@logseq/libs';
import { registerReplacer, unregisterReplacer } from './logic/replacer';
import { settingsSchema } from './settings';
import { initManager, openManager } from './ui/manager';

async function main() {
    logseq.useSettingsSchema(settingsSchema);
    logseq.provideModel({ openManager });
    await initManager();

    logseq.App.registerUIItem('toolbar', {
        key: 'logseq-snippets',
        template: `<a class="button" data-on-click="openManager" title="Snippets"><i class="ti ti-scissors"></i></a>`,
    });

    logseq.App.registerCommandPalette(
        { key: 'snippets-manage', label: 'Snippets: Manage snippets' },
        openManager
    );

    registerReplacer();
    logseq.beforeunload(async () => unregisterReplacer());
}

logseq.ready(main).catch(console.error);
