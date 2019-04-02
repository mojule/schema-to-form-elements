"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const __1 = require("..");
const type_1 = require("../templates/decorators/type");
describe('schema-forms', () => {
    describe('decorators', () => {
        describe('fieldset', () => {
            it('decorates', () => {
                const arrayTemplate = __1.ArrayTemplate(dom_1.document);
                const fieldsetArrayTemplate = __1.FieldsetDecorator(dom_1.document, arrayTemplate);
                const container = fieldsetArrayTemplate({ title: 'Foo' });
                assert.strictEqual(container.localName, 'fieldset');
                const legend = container.querySelector('legend');
                assert(legend);
                assert.strictEqual(legend.innerHTML, 'Foo');
            });
            it('decorates without legend', () => {
                const arrayTemplate = __1.ArrayTemplate(dom_1.document);
                const fieldsetArrayTemplate = __1.FieldsetDecorator(dom_1.document, arrayTemplate, false);
                const container = fieldsetArrayTemplate({ title: 'Foo' });
                assert.strictEqual(container.localName, 'fieldset');
                const legend = container.querySelector('legend');
                assert.strictEqual(legend, null);
            });
        });
        describe('label', () => {
            it('decorates', () => {
                const labelDecorator = __1.LabelDecorator(dom_1.document, __1.StringTemplate(dom_1.document));
                const editor = labelDecorator();
                assert.strictEqual(editor.localName, 'label');
                const input = editor.lastElementChild;
                assert(input);
                assert.strictEqual(input.type, 'text');
            });
            it('isSuffix true', () => {
                const labelDecorator = __1.LabelDecorator(dom_1.document, __1.StringTemplate(dom_1.document), true);
                const editor = labelDecorator();
                assert.strictEqual(editor.localName, 'label');
                const input = editor.firstElementChild;
                assert(input);
                assert.strictEqual(input.type, 'text');
            });
            it('label contains asterisk if required', () => {
                const labelDecorator = __1.LabelDecorator(dom_1.document, __1.StringTemplate(dom_1.document));
                const editor = labelDecorator({}, '', '', true);
                const span = editor.querySelector('span');
                assert(span.innerHTML.includes('*'));
            });
        });
        describe('format', () => {
            it('template from format', () => {
                const stringTemplates = {
                    string: __1.StringTemplate(dom_1.document),
                    multiline: __1.StringTemplate(dom_1.document, true)
                };
                const formatDecorator = __1.FormatDecorator(dom_1.document, stringTemplates);
                const multilineEl = formatDecorator({
                    format: 'multiline'
                });
                assert.strictEqual(multilineEl.localName, 'textarea');
            });
            it('ignores strings with no format', () => {
                const stringTemplates = {
                    string: __1.StringTemplate(dom_1.document)
                };
                const formatDecorator = __1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator();
                assert.strictEqual(el.type, 'text');
            });
            it('passes format through to type directly', () => {
                const stringTemplates = {
                    string: __1.StringTemplate(dom_1.document)
                };
                const formatDecorator = __1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator({ format: 'color' });
                assert.strictEqual(el.type, 'color');
            });
            it('finds input when decorated with wrapper element', () => {
                const stringTemplates = {
                    string: __1.LabelDecorator(dom_1.document, __1.StringTemplate(dom_1.document))
                };
                const formatDecorator = __1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator({ format: 'color' });
                const input = el.querySelector('input');
                assert.strictEqual(input.type, 'color');
            });
            it('fails when no input element', () => {
                const stringTemplates = {
                    string: __1.StringTemplate(dom_1.document, true)
                };
                const formatDecorator = __1.FormatDecorator(dom_1.document, stringTemplates);
                assert.throws(() => {
                    formatDecorator({ format: 'color' });
                });
            });
        });
        describe('mutable-array-list', () => {
            const templates = {
                string: __1.StringTemplate(dom_1.document)
            };
            templates.arrayList = __1.MutableArrayListDecorator(dom_1.document, dom_1.Event, __1.ArrayListTemplate(dom_1.document, templates), templates);
            templates.arrayItem = __1.MutableArrayItemDecorator(dom_1.document, __1.ArrayItemTemplate(dom_1.document, templates));
            it('creates an add action', () => {
                const container = templates.arrayList({ items: { type: 'string' } });
                const addActions = container.querySelectorAll('[data-action="array-list-add"]');
                assert.strictEqual(addActions.length, 1);
            });
            it('creates an empty container when no schema', () => {
                const container = templates.arrayList();
                assert.strictEqual(container.childElementCount, 0);
            });
            it('creates an empty container when items is an array', () => {
                const container = templates.arrayList({ items: [] });
                assert.strictEqual(container.childElementCount, 0);
            });
            it('creates an empty container when items has no type', () => {
                const container = templates.arrayList({ items: {} });
                assert.strictEqual(container.childElementCount, 0);
            });
            it('creates a delete action', () => {
                const item = templates.arrayItem({ type: 'string' });
                const deleteActions = item.querySelectorAll('[data-action="array-list-delete"]');
                assert.strictEqual(deleteActions.length, 1);
            });
            it('creates an li with a single button when no type', () => {
                const item = templates.arrayItem();
                assert.strictEqual(item.childElementCount, 1);
                const deleteActions = item.querySelectorAll('[data-action="array-list-delete"]');
                assert.strictEqual(deleteActions.length, 1);
            });
            it('adds', () => {
                const container = templates.arrayList({ items: { type: 'string' } });
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', '']
                ]);
            });
            it('removes', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                addAction.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const deleteActions = Array.from(container.querySelectorAll('[data-action="array-list-delete"]'));
                assert.strictEqual(deleteActions.length, 3);
                deleteActions[1].dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', '']
                ]);
            });
            it('adds with parent name', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } }, 'foo');
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['foo[0]', ''],
                    ['foo[1]', '']
                ]);
            });
            it('button without LI ancestor does not delete', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const deleteAction = container.querySelector('[data-action="array-list-delete"]');
                container.appendChild(deleteAction);
                deleteAction.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', '']
                ]);
            });
            it('click on container does not add or remove', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                container.dispatchEvent(new dom_1.Event('click', { bubbles: true }));
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', '']
                ]);
            });
        });
        describe('type', () => {
            it('decorates name with type', () => {
                const stringTemplate = type_1.TypeDecorator(dom_1.document, __1.StringTemplate(dom_1.document));
                const input = stringTemplate({ type: 'string' }, 'foo');
                assert.strictEqual(input.name, 'foo__string');
            });
            it('no default name', () => {
                const stringTemplate = type_1.TypeDecorator(dom_1.document, __1.StringTemplate(dom_1.document));
                const input = stringTemplate({ type: 'string' });
                assert.strictEqual(input.name, '__string');
            });
            it('does not decorate when no type', () => {
                const stringTemplate = type_1.TypeDecorator(dom_1.document, __1.StringTemplate(dom_1.document));
                const input = stringTemplate();
                assert(!input.hasAttribute('name'));
            });
        });
    });
});
//# sourceMappingURL=decorators.js.map