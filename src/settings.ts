import '@logseq/libs';
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

const KEY = { space: 'Space', punctuation: 'Punctuation ( , . ; )', tab: 'Tab' } as const;
const ENTER = {
    expand: 'Expand only',
    newBlock: 'Expand and create a new block',
    never: 'Never expand on Enter',
} as const;
const NOTIFY = ['always', 'errors-only', 'never'] as const;

export const settingsSchema: SettingSchemaDesc[] = [
    {
        key: 'headingExpansion',
        type: 'heading',
        default: null,
        title: 'Expansion',
        description:
            'Manage your snippets with the ✂️ toolbar icon or the command palette → "Snippets: Manage snippets".',
    },
    {
        key: 'expandOn',
        type: 'enum',
        default: [KEY.space, KEY.punctuation],
        title: 'Expand On',
        description: 'Keys that expand a trigger typed right before them',
        enumChoices: Object.values(KEY),
        enumPicker: 'checkbox',
    },
    {
        key: 'enterBehavior',
        type: 'enum',
        default: ENTER.expand,
        title: 'Enter Key',
        description: 'What Enter does after a trigger',
        enumChoices: Object.values(ENTER),
        enumPicker: 'radio',
    },
    {
        key: 'triggerPrefix',
        type: 'string',
        default: '',
        title: 'Trigger Prefix',
        description:
            'Only expand triggers typed with this prefix, e.g. ";" → type ";gh". Leave empty to disable.',
    },
    {
        key: 'caseSensitive',
        type: 'boolean',
        default: false,
        title: 'Case Sensitive',
        description: 'Only expand triggers typed with exactly the same case',
    },
    {
        key: 'matchCase',
        type: 'boolean',
        default: false,
        title: 'Match Capitalisation',
        description:
            'Adapt the replacement to how the trigger was typed: "Gm" → first letter capitalised, "GM" → ALL CAPS. Only when case sensitivity is off.',
    },
    {
        key: 'headingNotifications',
        type: 'heading',
        default: null,
        title: 'Notifications',
        description: '',
    },
    {
        key: 'showNotifications',
        type: 'enum',
        default: 'errors-only',
        title: 'Show Expansion Notifications',
        description: 'When to show a message after a snippet was expanded',
        enumChoices: [...NOTIFY],
        enumPicker: 'radio',
    },
    {
        key: 'headingAdvanced',
        type: 'heading',
        default: null,
        title: 'Advanced',
        description: '',
    },
    {
        key: 'snippets',
        type: 'string',
        default:
            'gh ;; GitHub\ngm ;; Good Morning\ntoday ;; {date}\nnow ;; {datetime}\nmeeting ;; ## Meeting Notes\\n- Date: {date}\\n- Attendees: {cursor}\\n- Topics: ',
        title: 'Snippets (Raw Text)',
        description: `The plain-text version of the Snippet Manager. One snippet per line: trigger ;; replacement
Use \\n for line breaks and # for comments (comments are removed when saving from the manager).
Variables: {date}, {time}, {datetime}, {clipboard}, {cursor}`,
        inputAs: 'textarea',
    },
];

const setting = <T>(key: string, fallback: T): T => (logseq.settings?.[key] as T) ?? fallback;

export function expandKeys() {
    const keys = setting<string[]>('expandOn', [KEY.space, KEY.punctuation]);
    const chars = new Set<string>();
    if (keys.includes(KEY.space)) chars.add(' ');
    if (keys.includes(KEY.punctuation)) [',', '.', ';'].forEach(c => chars.add(c));
    return { chars, tab: keys.includes(KEY.tab) };
}

export function enterMode(): 'expand' | 'newBlock' | 'never' {
    const value = setting<string>('enterBehavior', ENTER.expand);
    if (value === ENTER.newBlock) return 'newBlock';
    return value === ENTER.never ? 'never' : 'expand';
}

export const triggerPrefix = () => setting('triggerPrefix', '').trim();
export const isCaseSensitive = () => Boolean(setting('caseSensitive', false));
export const matchCase = () => !isCaseSensitive() && Boolean(setting('matchCase', false));
export const notifyMode = () =>
    setting<(typeof NOTIFY)[number]>('showNotifications', 'errors-only');

/** Short usage hint reflecting the current settings, e.g. "Type ;trigger, then Space or Enter". */
export function expandHint() {
    const { chars, tab } = expandKeys();
    const keys = [
        chars.has(' ') && 'Space',
        chars.has(',') && 'punctuation',
        tab && 'Tab',
        enterMode() !== 'never' && 'Enter',
    ].filter(Boolean);
    const trigger = `${triggerPrefix()}trigger`;
    return keys.length
        ? `Type ${trigger}, then ${keys.join(', ').replace(/, ([^,]*)$/, ' or $1')} to expand`
        : 'No expansion keys enabled – check the settings';
}
