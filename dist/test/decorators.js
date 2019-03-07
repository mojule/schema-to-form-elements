"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const array_1 = require("../templates/types/array");
const fieldset_1 = require("../templates/decorators/fieldset");
const string_1 = require("../templates/types/string");
const format_1 = require("../templates/decorators/format");
const label_1 = require("../templates/decorators/label");
const mutable_array_list_1 = require("../templates/decorators/mutable-array-list");
const array_list_1 = require("../templates/array-list");
const array_item_1 = require("../templates/array-item");
describe('schema-forms', () => {
    describe('decorators', () => {
        describe('fieldset', () => {
            it('decorates', () => {
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document);
                const fieldsetArrayTemplate = fieldset_1.FieldsetDecorator(dom_1.document, arrayTemplate);
                const container = fieldsetArrayTemplate({ title: 'Foo', type: 'array' });
                assert.strictEqual(container.localName, 'fieldset');
                const legend = container.querySelector('legend');
                assert(legend);
                assert.strictEqual(legend.innerHTML, 'Foo');
            });
            it('decorates without legend', () => {
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document);
                const fieldsetArrayTemplate = fieldset_1.FieldsetDecorator(dom_1.document, arrayTemplate, false);
                const container = fieldsetArrayTemplate({ title: 'Foo', type: 'array' });
                assert.strictEqual(container.localName, 'fieldset');
                const legend = container.querySelector('legend');
                assert.strictEqual(legend, null);
            });
        });
        describe('label', () => {
            it('decorates', () => {
                const labelDecorator = label_1.LabelDecorator(dom_1.document, string_1.StringTemplate(dom_1.document));
                const editor = labelDecorator({ type: 'string' });
                assert.strictEqual(editor.localName, 'label');
                const input = editor.lastElementChild;
                assert(input);
                assert.strictEqual(input.type, 'text');
            });
            it('isSuffix true', () => {
                const labelDecorator = label_1.LabelDecorator(dom_1.document, string_1.StringTemplate(dom_1.document), true);
                const editor = labelDecorator({ type: 'string' });
                assert.strictEqual(editor.localName, 'label');
                const input = editor.firstElementChild;
                assert(input);
                assert.strictEqual(input.type, 'text');
            });
        });
        describe('format', () => {
            it('template from format', () => {
                const stringTemplates = {
                    string: string_1.StringTemplate(dom_1.document),
                    multiline: string_1.StringTemplate(dom_1.document, true)
                };
                const formatDecorator = format_1.FormatDecorator(dom_1.document, stringTemplates);
                const multilineEl = formatDecorator({
                    type: 'string',
                    format: 'multiline'
                });
                assert.strictEqual(multilineEl.localName, 'textarea');
            });
            it('ignores strings with no format', () => {
                const stringTemplates = {
                    string: string_1.StringTemplate(dom_1.document)
                };
                const formatDecorator = format_1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator({ type: 'string' });
                assert.strictEqual(el.type, 'text');
            });
            it('passes format through to type directly', () => {
                const stringTemplates = {
                    string: string_1.StringTemplate(dom_1.document)
                };
                const formatDecorator = format_1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator({ type: 'string', format: 'color' });
                assert.strictEqual(el.type, 'color');
            });
            it('finds input when decorated with wrapper element', () => {
                const stringTemplates = {
                    string: label_1.LabelDecorator(dom_1.document, string_1.StringTemplate(dom_1.document))
                };
                const formatDecorator = format_1.FormatDecorator(dom_1.document, stringTemplates);
                const el = formatDecorator({ type: 'string', format: 'color' });
                const input = el.querySelector('input');
                assert.strictEqual(input.type, 'color');
            });
            it('fails when no input element', () => {
                const stringTemplates = {
                    string: string_1.StringTemplate(dom_1.document, true)
                };
                const formatDecorator = format_1.FormatDecorator(dom_1.document, stringTemplates);
                assert.throws(() => {
                    formatDecorator({ type: 'string', format: 'color' });
                });
            });
        });
        describe('mutable-array-list', () => {
            const templates = {
                string: string_1.StringTemplate(dom_1.document)
            };
            templates.arrayList = mutable_array_list_1.MutableArrayListDecorator(dom_1.document, array_list_1.ArrayListTemplate(dom_1.document, templates), templates);
            templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(dom_1.document, array_item_1.ArrayItemTemplate(dom_1.document, templates));
            const click = new dom_1.Event('click', { bubbles: true });
            it('creates an add action', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const addActions = container.querySelectorAll('[data-action="array-list-add"]');
                assert.strictEqual(addActions.length, 1);
            });
            it('creates a delete action', () => {
                const item = templates.arrayItem({ type: 'string' });
                const deleteActions = item.querySelectorAll('[data-action="array-list-delete"]');
                assert.strictEqual(deleteActions.length, 1);
            });
            it('adds', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(click);
                const entries = dom_1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', '']
                ]);
            });
            it('removes', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(click);
                addAction.dispatchEvent(click);
                const deleteActions = Array.from(container.querySelectorAll('[data-action="array-list-delete"]'));
                assert.strictEqual(deleteActions.length, 3);
                deleteActions[1].dispatchEvent(click);
                const entries = dom_1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', '']
                ]);
            });
            it('adds with parent name', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } }, 'foo');
                const addAction = container.querySelector('[data-action="array-list-add"]');
                addAction.dispatchEvent(click);
                const entries = dom_1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['foo[0]', ''],
                    ['foo[1]', '']
                ]);
            });
            it('schema must be array-list', () => {
                assert.throws(() => templates.arrayList({ type: 'array' }));
            });
            it('button without LI ancestor does not delete', () => {
                const container = templates.arrayList({ type: 'array', items: { type: 'string' } });
                const deleteAction = container.querySelector('[data-action="array-list-delete"]');
                container.appendChild(deleteAction);
                deleteAction.dispatchEvent(click);
                const entries = dom_1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', '']
                ]);
            });
        });
    });
});
//# sourceMappingURL=decorators.js.map