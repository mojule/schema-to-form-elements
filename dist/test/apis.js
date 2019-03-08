"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const __1 = require("..");
describe('schema-forms', () => {
    describe('apis', () => {
        describe('array-list', () => {
            const templates = {
                string: __1.StringTemplate(dom_1.document)
            };
            templates.array = __1.ArrayTemplate(dom_1.document, templates);
            const schema = {
                type: 'array',
                items: {
                    type: 'string'
                }
            };
            it('creates', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                assert(api);
            });
            it('container must have an OL', () => {
                const container = dom_1.document.createElement('div');
                assert.throws(() => __1.ArrayListApi(dom_1.document, container, schema, templates));
            });
            it('schema must be array-list', () => {
                const container = templates.array(schema);
                assert.throws(() => __1.ArrayListApi(dom_1.document, container, {}, templates));
                assert.throws(() => __1.ArrayListApi(dom_1.document, container, { items: [] }, templates));
            });
            it('child schema type must be a string', () => {
                const container = templates.array(schema);
                assert.throws(() => __1.ArrayListApi(dom_1.document, container, { items: {} }, templates));
            });
            it('child schema must have a template', () => {
                const container = templates.array(schema);
                assert.throws(() => __1.ArrayListApi(dom_1.document, container, { items: { type: 'number' } }, templates));
            });
            it('count', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                assert.strictEqual(api.count, 1);
            });
            it('clear', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                api.clear();
                assert.strictEqual(api.count, 0);
            });
            it('add with implicit arrayItem', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                api.add('bar');
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', 'bar']
                ]);
            });
            it('add with explicit arrayItem', () => {
                const templates = {
                    string: __1.StringTemplate(dom_1.document)
                };
                templates.array = __1.ArrayTemplate(dom_1.document, templates);
                templates.arrayItem = __1.ArrayItemTemplate(dom_1.document, templates);
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                api.add('bar');
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', 'bar']
                ]);
            });
            it('add with name', () => {
                const container = templates.array(schema, 'foo');
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                api.add('bar');
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['foo[0]', ''],
                    ['foo[1]', 'bar']
                ]);
            });
            it('removes', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                api.add('bar');
                api.add('baz');
                api.remove(1);
                const entries = __1.getEntries(dom_1.form({}, container));
                assert.deepEqual(entries, [
                    ['0', ''],
                    ['1', 'baz']
                ]);
            });
            it('remove throws on bad index', () => {
                const container = templates.array(schema);
                const api = __1.ArrayListApi(dom_1.document, container, schema, templates);
                assert.throws(() => api.remove(1));
            });
        });
    });
});
//# sourceMappingURL=apis.js.map