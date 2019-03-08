"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const utils_1 = require("../templates/utils");
const string_1 = require("../templates/types/string");
const tuple_1 = require("../templates/types/array/tuple");
const type_1 = require("../templates/decorators/type");
const __1 = require("..");
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
    describe('getChildName', () => {
        it('uses square brackets if parent name', () => {
            const name = utils_1.getChildName('foo', 0);
            assert.strictEqual(name, 'foo[0]');
        });
        it('does not use square brackets if no parent name', () => {
            const name = utils_1.getChildName('', 0);
            assert.strictEqual(name, '0');
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
            const entries = utils_1.getEntries(tupleFormEl);
            assert.deepEqual(entries, [
                ['foo[0]', 'bar'],
                ['foo[1]', 'baz'],
                ['foo[2]', '']
            ]);
        });
        it('gets entries from a typed form', () => {
            const tupleTemplate = tuple_1.TupleTemplate(dom_1.document, {
                string: type_1.TypeDecorator(dom_1.document, string_1.StringTemplate(dom_1.document)),
                number: type_1.TypeDecorator(dom_1.document, __1.NumberTemplate(dom_1.document)),
                boolean: type_1.TypeDecorator(dom_1.document, __1.BooleanTemplate(dom_1.document))
            });
            const foo = tupleTemplate({
                type: 'array',
                items: [
                    { type: 'string' },
                    { type: 'number' },
                    { type: 'boolean' },
                    { type: 'boolean' }
                ],
                default: [
                    'bar', 1.1, true, false
                ]
            }, 'foo');
            const tupleFormEl = form({}, foo);
            const entries = utils_1.getEntries(tupleFormEl);
            assert.deepEqual(entries, [
                ['foo[0]', 'bar'],
                ['foo[1]', 1.1],
                ['foo[2]', true],
                ['foo[3]', false]
            ]);
        });
        it('keyToJsonPointer', () => {
            assert.strictEqual(utils_1.keyToJsonPointer(''), '/');
            assert.strictEqual(utils_1.keyToJsonPointer('foo[0]'), '/foo/0');
            assert.strictEqual(utils_1.keyToJsonPointer('[0]'), '/0');
            assert.strictEqual(utils_1.keyToJsonPointer('0'), '/0');
        });
        it('gets pointers from entries', () => {
            const tuplePointers = utils_1.entriesToPointers(utils_1.getEntries(tupleFormEl));
            assert.deepEqual(tuplePointers, [
                ['/foo/0', 'bar'],
                ['/foo/1', 'baz'],
                ['/foo/2', '']
            ]);
        });
    });
});
//# sourceMappingURL=utils.js.map