import '@logseq/libs';
import './styles.css';
import {
    loadSnippets,
    normalizeTrigger,
    parseSnippets,
    saveSnippets,
    Snippet,
    VARIABLES,
} from '../logic/snippets';
import { expandHint } from '../settings';

interface Item extends Snippet {
    id: number;
}

let items: Item[] = [];
let nextId = 0;
let openId: number | null = null;
let query = '';
let saveTimer: number | undefined;

const app = document.getElementById('app')!;

type Attrs = Record<string, string | boolean | EventListener>;
function h<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Attrs = {},
    ...children: (Node | string)[]
) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (typeof v === 'boolean') el.toggleAttribute(k, v);
        else el.setAttribute(k, v);
    }
    el.append(...children);
    return el;
}

const icon = (name: string) => {
    const i = h('span', { class: 'icon', 'aria-hidden': 'true' });
    i.innerHTML = ICONS[name];
    return i;
};

/* ---------- state ---------- */

const toItems = (snippets: Snippet[]): Item[] => snippets.map(s => ({ ...s, id: nextId++ }));

function duplicates(): Set<string> {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const { trigger } of items) {
        const key = normalizeTrigger(trigger.trim());
        if (key && seen.has(key)) dupes.add(key);
        seen.add(key);
    }
    return dupes;
}

function scheduleSave() {
    setStatus('Saving…');
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(flushSave, 400);
}

async function flushSave() {
    if (saveTimer === undefined) return;
    clearTimeout(saveTimer);
    saveTimer = undefined;
    await saveSnippets(items);
    setStatus('All changes saved');
}

function setStatus(text: string) {
    const el = app.querySelector('.status');
    if (el) el.textContent = text;
}

/* ---------- rendering ---------- */

function preview(text: string) {
    const frag = document.createDocumentFragment();
    const firstLine = text.split('\n')[0];
    for (const part of firstLine.split(/(\{\w+\})/)) {
        if (!part) continue;
        frag.append(VARIABLES.includes(part as never) ? h('span', { class: 'var' }, part) : part);
    }
    if (text.includes('\n'))
        frag.append(h('span', { class: 'more' }, ` +${text.split('\n').length - 1} lines`));
    return frag;
}

function renderRow(item: Item, dupes: Set<string>) {
    const isOpen = item.id === openId;
    const dup = dupes.has(normalizeTrigger(item.trigger.trim()));

    const head = h(
        'button',
        { class: 'row-head', 'aria-expanded': String(isOpen), onClick: () => toggle(item.id) },
        h('code', { class: 'trigger' }, item.trigger || '—'),
        h('span', { class: 'arrow' }, '→'),
        h('span', { class: 'preview' }, preview(item.replacement)),
        dup
            ? h(
                  'span',
                  { class: 'badge warn', title: 'Another snippet uses the same trigger' },
                  'Duplicate'
              )
            : '',
        icon('chevron')
    );

    const row = h(
        'li',
        { class: `row${isOpen ? ' open' : ''}${dup ? ' dup' : ''}`, 'data-id': String(item.id) },
        head
    );
    if (isOpen) row.append(renderEditor(item));
    return row;
}

function renderEditor(item: Item) {
    const update = (patch: Partial<Snippet>) => {
        Object.assign(item, patch);
        refreshRowHeads();
        scheduleSave();
    };

    const trigger = h('input', {
        class: 'input mono',
        value: item.trigger,
        placeholder: 'e.g. sig',
        spellcheck: 'false',
        onInput: () => {
            trigger.value = trigger.value.replace(/\s/g, '');
            update({ trigger: trigger.value });
        },
    }) as HTMLInputElement;

    const replacement = h('textarea', {
        class: 'input',
        rows: '4',
        placeholder: 'Text to insert…',
        onInput: () => update({ replacement: replacement.value }),
    }) as HTMLTextAreaElement;
    replacement.value = item.replacement;

    const insertVar = (v: string) => {
        replacement.setRangeText(v, replacement.selectionStart, replacement.selectionEnd, 'end');
        replacement.focus();
        update({ replacement: replacement.value });
    };

    queueMicrotask(() => (item.trigger ? replacement : trigger).focus());

    return h(
        'div',
        { class: 'editor' },
        h('label', { class: 'field' }, h('span', {}, 'Trigger'), trigger),
        h('label', { class: 'field' }, h('span', {}, 'Replacement'), replacement),
        h(
            'div',
            { class: 'editor-foot' },
            h(
                'div',
                { class: 'chips' },
                ...VARIABLES.map(v =>
                    h(
                        'button',
                        { class: 'chip', title: `Insert ${v}`, onClick: () => insertVar(v) },
                        v
                    )
                )
            ),
            h(
                'button',
                { class: 'btn ghost danger', onClick: () => remove(item.id) },
                icon('trash'),
                'Delete'
            )
        )
    );
}

function refreshRowHeads() {
    const dupes = duplicates();
    for (const row of app.querySelectorAll<HTMLElement>('.row')) {
        const it = items.find(i => String(i.id) === row.dataset.id);
        if (!it) continue;
        const fresh = renderRow(it, dupes);
        row.className = fresh.className;
        row.querySelector('.row-head')!.replaceWith(fresh.querySelector('.row-head')!);
    }
    updateCount();
}

function updateCount() {
    const el = app.querySelector('.count');
    if (el) el.textContent = String(items.length);
}

function renderList() {
    const list = app.querySelector('.list')!;
    const q = query.toLowerCase();
    const visible = items.filter(
        i => !q || i.trigger.toLowerCase().includes(q) || i.replacement.toLowerCase().includes(q)
    );
    const dupes = duplicates();

    list.replaceChildren(
        ...(visible.length
            ? visible.map(i => renderRow(i, dupes))
            : [
                  h(
                      'li',
                      { class: 'empty' },
                      icon('sparkles'),
                      h(
                          'p',
                          {},
                          items.length ? 'No snippets match your search.' : 'No snippets yet.'
                      ),
                      items.length
                          ? ''
                          : h(
                                'button',
                                { class: 'btn primary', onClick: add },
                                icon('plus'),
                                'Create your first snippet'
                            )
                  ),
              ])
    );
    updateCount();
}

function renderShell() {
    const search = h('input', {
        class: 'input search',
        type: 'search',
        placeholder: 'Search snippets…',
        value: query,
        onInput: () => {
            query = search.value;
            renderList();
        },
    }) as HTMLInputElement;

    app.replaceChildren(
        h(
            'div',
            {
                class: 'backdrop',
                onMousedown: (e: Event) => e.target === e.currentTarget && close(),
            },
            h(
                'section',
                {
                    class: 'panel',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-labelledby': 'title',
                },
                h(
                    'header',
                    { class: 'header' },
                    h('h1', { id: 'title' }, 'Snippets', h('span', { class: 'count' }, '0')),
                    h(
                        'button',
                        { class: 'btn icon-only', title: 'Close (Esc)', onClick: close },
                        icon('x')
                    )
                ),
                h(
                    'div',
                    { class: 'toolbar' },
                    h('div', { class: 'search-wrap' }, icon('search'), search),
                    h(
                        'button',
                        { class: 'btn ghost', title: 'Import from file', onClick: pickImport },
                        icon('upload'),
                        h('span', { class: 'label' }, 'Import')
                    ),
                    h(
                        'button',
                        { class: 'btn ghost', title: 'Export to file', onClick: exportFile },
                        icon('download'),
                        h('span', { class: 'label' }, 'Export')
                    ),
                    h(
                        'button',
                        { class: 'btn primary', onClick: add },
                        icon('plus'),
                        h('span', { class: 'label' }, 'New')
                    )
                ),
                h('div', { class: 'notice', hidden: true }),
                h('ul', { class: 'list' }),
                h(
                    'footer',
                    { class: 'footer' },
                    h('span', { class: 'status' }, expandHint()),
                    h('button', { class: 'link', onClick: openSettings }, 'Settings')
                )
            )
        )
    );
    renderList();
}

/* ---------- actions ---------- */

function toggle(id: number) {
    openId = openId === id ? null : id;
    renderList();
}

function add() {
    const item = { id: nextId++, trigger: '', replacement: '' };
    items.unshift(item);
    openId = item.id;
    query = '';
    (app.querySelector('.search') as HTMLInputElement).value = '';
    renderList();
}

function remove(id: number) {
    items = items.filter(i => i.id !== id);
    if (openId === id) openId = null;
    renderList();
    scheduleSave();
}

function exportFile() {
    const blob = new Blob([String(logseq.settings?.['snippets'] ?? '')], { type: 'text/plain' });
    const a = h('a', {
        href: URL.createObjectURL(blob),
        download: `logseq-snippets-${new Date().toISOString().slice(0, 10)}.txt`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
}

function pickImport() {
    const input = h('input', { type: 'file', accept: '.txt,.json' }) as HTMLInputElement;
    input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const imported = parseSnippets(await file.text());
        if (!imported.length) return showNotice(`No valid snippets found in ${file.name}.`);

        const apply = (replace: boolean) => {
            items = [...(replace ? [] : items), ...toItems(imported)];
            openId = null;
            hideNotice();
            renderList();
            scheduleSave();
            logseq.UI.showMsg(`Imported ${imported.length} snippets`, 'success');
        };
        showNotice(
            `Found ${imported.length} snippets in ${file.name}.`,
            h('button', { class: 'btn primary', onClick: () => apply(false) }, 'Append'),
            h('button', { class: 'btn ghost danger', onClick: () => apply(true) }, 'Replace all'),
            h('button', { class: 'btn ghost', onClick: hideNotice }, 'Cancel')
        );
    });
    input.click();
}

function showNotice(text: string, ...actions: Node[]) {
    const el = app.querySelector<HTMLElement>('.notice')!;
    el.replaceChildren(
        h('span', {}, text),
        ...(actions.length
            ? actions
            : [h('button', { class: 'btn ghost', onClick: hideNotice }, 'OK')])
    );
    el.hidden = false;
}

function hideNotice() {
    app.querySelector<HTMLElement>('.notice')!.hidden = true;
}

/* ---------- open / close ---------- */

export function openManager() {
    items = toItems(loadSnippets());
    openId = null;
    query = '';
    renderShell();
    logseq.showMainUI({ autoFocus: true });
    (app.querySelector('.search') as HTMLInputElement).focus();
}

async function close() {
    await flushSave();
    logseq.hideMainUI({ restoreEditingCursor: true });
}

/** The manager overlay sits above Logseq's settings dialog, so close it first. */
async function openSettings() {
    await close();
    logseq.showSettingsUI();
}

export async function initManager() {
    logseq.setMainUIInlineStyle({ zIndex: 999 });

    const setTheme = (mode: string) => (document.documentElement.dataset.theme = mode);
    setTheme((await logseq.App.getUserConfigs()).preferredThemeMode);
    logseq.App.onThemeModeChanged(({ mode }) => setTheme(mode));

    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        if (
            openId !== null &&
            app.contains(document.activeElement) &&
            document.activeElement !== app.querySelector('.search')
        ) {
            toggle(openId);
        } else {
            void close();
        }
    });
}

const svg = (d: string) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICONS: Record<string, string> = {
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
    upload: svg('<path d="M12 15V3m0 0L7 8m5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
    download: svg('<path d="M12 3v12m0 0-5-5m5 5 5-5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
    trash: svg(
        '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'
    ),
    chevron: svg('<path d="m6 9 6 6 6-6"/>'),
    sparkles: svg(
        '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>'
    ),
};
