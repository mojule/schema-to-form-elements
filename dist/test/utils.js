"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const utils_1 = require("../templates/utils");
const string_1 = require("../templates/types/string");
const tuple_1 = require("../templates/tuple");
describe('utils', () => {
    describe('getTitle', () => {
        it('gets title from schema', () => {
            const title = utils_1.getTitle({ title: 'Title' });
            assert.strictEqual(title, 'Title');
        });
        it('gets title from name', () => {
            const title = utils_1.getTitle({}, 'Title');
            assert.strictEqual(title, 'Title');
        });
        it('gets title from default fallback', () => {
            const title = utils_1.getTitle({});
            assert.strictEqual(title, 'Schema');
        });
        it('gets title from explicit fallback', () => {
            const title = utils_1.getTitle({}, '', 'Title');
            assert.strictEqual(title, 'Title');
        });
    });
    describe('H', () => {
        it('creates HTML templates', () => {
            const div = utils_1.H(dom_1.document, 'div');
            const span = utils_1.H(dom_1.document, 'span');
            const el = div({ id: 'foo' }, span());
            assert.strictEqual(el.localName, 'div');
            assert.strictEqual(el.id, 'foo');
            assert.strictEqual(el.firstElementChild.localName, 'span');
        });
    });
    describe('Form', () => {
        const form = utils_1.Form(dom_1.document);
        it('generates a form element', () => {
            const el = form();
            assert.strictEqual(el.localName, 'form');
        });
    });
    describe('entries', () => {
        const form = utils_1.Form(dom_1.document);
        const stringTemplate = string_1.StringTemplate(dom_1.document);
        const tupleTemplate = tuple_1.TupleTemplate(dom_1.document, { string: stringTemplate });
        const foo = tupleTemplate({
            type: 'array',
            items: [
                { type: 'string' },
                { type: 'string' },
                { type: 'string' }
            ],
            default: [
                'bar', 'baz'
            ]
        }, 'foo');
        const tupleFormEl = form({}, foo);
        it('gets entries from a form', () => {
            const entries = utils_1.GetEntries(dom_1.FormData)(tupleFormEl);
            assert.deepEqual(entries, [
                ['foo[0]', 'bar'],
                ['foo[1]', 'baz'],
                ['foo[2]', '']
            ]);
        });
        it('keyToJsonPointer', () => {
            assert.strictEqual(utils_1.keyToJsonPointer(''), '/');
            assert.strictEqual(utils_1.keyToJsonPointer('foo[0]'), '/foo/0');
            assert.strictEqual(utils_1.keyToJsonPointer('[0]'), '/0');
            assert.strictEqual(utils_1.keyToJsonPointer('0'), '/0');
        });
        it('gets pointers from entries', () => {
            const tuplePointers = utils_1.entriesToPointers(utils_1.GetEntries(dom_1.FormData)(tupleFormEl));
            assert.deepEqual(tuplePointers, [
                ['/foo/0', 'bar'],
                ['/foo/1', 'baz'],
                ['/foo/2', '']
            ]);
        });
    });
});
//# sourceMappingURL=utils.js.map