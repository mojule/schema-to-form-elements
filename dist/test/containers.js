"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const string_1 = require("../templates/types/string");
const object_1 = require("../templates/types/object");
const tuple_1 = require("../templates/tuple");
const array_list_1 = require("../templates/array-list");
const array_item_1 = require("../templates/array-item");
const array_1 = require("../templates/types/array");
describe('schema-forms', () => {
    describe('containers', () => {
        const fixtures = {
            object: {
                type: 'object',
                title: 'Object',
                children: {
                    properties: {
                        bar: { type: 'string' }
                    }
                },
                childrenNoType: {
                    properties: {
                        bar: { type: ['string', 'number'] }
                    }
                },
                childName: 'bar',
                template: object_1.ObjectTemplate(dom_1.document, {
                    string: string_1.StringTemplate(dom_1.document)
                }),
                bareTemplate: object_1.ObjectTemplate(dom_1.document),
                value: { bar: 'qux' }
            },
            tuple: {
                type: 'array',
                title: 'Tuple',
                children: {
                    items: [
                        { type: 'string' }
                    ]
                },
                childrenNoType: {
                    items: [
                        { type: ['string', 'number'] }
                    ]
                },
                childName: '0',
                template: tuple_1.TupleTemplate(dom_1.document, {
                    string: string_1.StringTemplate(dom_1.document)
                }),
                bareTemplate: tuple_1.TupleTemplate(dom_1.document),
                value: ['qux']
            },
            'array-list': {
                type: 'array',
                title: 'Array List',
                children: {
                    items: {
                        type: 'string'
                    }
                },
                childrenNoType: {
                    items: {
                        type: ['string', 'number']
                    }
                },
                childName: '0',
                template: array_list_1.ArrayListTemplate(dom_1.document, {
                    string: string_1.StringTemplate(dom_1.document)
                }),
                bareTemplate: array_list_1.ArrayListTemplate(dom_1.document),
                value: ['qux']
            }
        };
        const testContainer = (key) => {
            const fixture = fixtures[key];
            const { type, title, children, childrenNoType, childName, template, bareTemplate, value } = fixture;
            it('creates', () => {
                const container = template({ type });
                assert.strictEqual(typeof container.localName, 'string');
            });
            it('default title', () => {
                const container = template({ type });
                assert.strictEqual(container.title, title);
            });
            it('name', () => {
                const container = template({ type }, 'foo');
                assert.strictEqual(container.dataset.name, 'foo');
            });
            it('creates child', () => {
                const container = template(Object.assign({ type }, children));
                const containerChildren = container.querySelectorAll('input');
                assert.strictEqual(containerChildren.length, 1);
                const child = [...containerChildren][0];
                assert.strictEqual(child.name, childName);
            });
            it('ignores child with non-string type', () => {
                const container = template(Object.assign({ type }, childrenNoType));
                const containerChildren = container.querySelectorAll('input');
                assert.strictEqual(containerChildren.length, 0);
            });
            it('ignores type on child that has no template', () => {
                const container = bareTemplate(Object.assign({ type }, children));
                const containerChildren = container.querySelectorAll('input');
                assert.strictEqual(containerChildren.length, 0);
            });
            it('passes name to child', () => {
                const container = template(Object.assign({ type }, children), 'foo');
                const child = container.querySelector('input');
                assert.strictEqual(child.name, `foo[${childName}]`);
            });
            it('populates child from value', () => {
                const container = template(Object.assign({ type }, children), 'foo', value);
                const child = container.querySelector('input');
                assert.strictEqual(child.defaultValue, 'qux');
            });
            it('populates child from default', () => {
                const container = template(Object.assign({ type }, children, { default: value }));
                const child = container.querySelector('input');
                assert.strictEqual(child.defaultValue, 'qux');
            });
        };
        describe('object', () => {
            testContainer('object');
            it('passes required to child', () => {
                const container = fixtures.object.template({
                    type: 'object',
                    properties: {
                        bar: { type: 'string' }
                    },
                    required: ['bar']
                });
                assert.strictEqual(container.childElementCount, 1);
                const child = container.firstElementChild;
                assert(child.hasAttribute('required'));
            });
        });
        describe('array', () => {
            it('calls implicit tuple delegate', () => {
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document, { string: string_1.StringTemplate(dom_1.document) });
                const container = arrayTemplate({
                    type: 'array',
                    items: [
                        { type: 'string' }
                    ]
                });
                assert.strictEqual(container.childElementCount, 1);
                assert.strictEqual(container.firstElementChild.type, 'text');
            });
            it('calls explicit tuple delegate', () => {
                const templates = {
                    string: string_1.StringTemplate(dom_1.document)
                };
                templates.tuple = tuple_1.TupleTemplate(dom_1.document, templates);
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document, templates);
                const container = arrayTemplate({
                    type: 'array',
                    items: [
                        { type: 'string' }
                    ]
                });
                assert.strictEqual(container.childElementCount, 1);
                assert.strictEqual(container.firstElementChild.type, 'text');
            });
            it('calls implicit array-list delegate', () => {
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document, { string: string_1.StringTemplate(dom_1.document) });
                const container = arrayTemplate({
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                });
                const ol = container.querySelector('ol');
                assert(ol);
                assert.strictEqual(ol.childElementCount, 1);
                const inputs = ol.querySelectorAll('input');
                assert.strictEqual(inputs.length, 1);
            });
            it('calls explicit array-list delegate', () => {
                const templates = {
                    string: string_1.StringTemplate(dom_1.document)
                };
                templates.arrayList = array_list_1.ArrayListTemplate(dom_1.document, templates);
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document, templates);
                const container = arrayTemplate({
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                });
                const ol = container.querySelector('ol');
                assert(ol);
                assert.strictEqual(ol.childElementCount, 1);
                const inputs = ol.querySelectorAll('input');
                assert.strictEqual(inputs.length, 1);
            });
            it('passes schema.default to delegate', () => {
                const arrayTemplate = array_1.ArrayTemplate(dom_1.document, { string: string_1.StringTemplate(dom_1.document) });
                const container = arrayTemplate({
                    type: 'array',
                    items: [
                        { type: 'string' }
                    ],
                    default: ['foo']
                });
                assert.strictEqual(container.childElementCount, 1);
                assert.strictEqual(container.firstElementChild.defaultValue, 'foo');
            });
            describe('tuple', () => {
                testContainer('tuple');
            });
            describe('array-list', () => {
                const fixture = fixtures['array-list'];
                const { type, children, template } = fixture;
                testContainer('array-list');
                it('minItems', () => {
                    const container = template(Object.assign({ type }, children, { minItems: 2 }));
                    const containerChildren = container.querySelectorAll('input');
                    assert.strictEqual(containerChildren.length, 2);
                });
                it('maxItems', () => {
                    const container = template(Object.assign({ type }, children, { maxItems: 2 }));
                    const containerChildren = container.querySelectorAll('input');
                    assert.strictEqual(containerChildren.length, 2);
                });
                it('minItems overrides values', () => {
                    const container = template(Object.assign({ type }, children, { minItems: 2 }), 'foo', ['qux']);
                    const containerChildren = container.querySelectorAll('input');
                    assert.strictEqual(containerChildren.length, 2);
                });
                it('maxItems overrides values', () => {
                    const container = template(Object.assign({ type }, children, { maxItems: 2 }), 'foo', ['qux', 'wub', 'bub']);
                    const containerChildren = container.querySelectorAll('input');
                    assert.strictEqual(containerChildren.length, 2);
                });
            });
            describe('array-item', () => {
                const template = array_item_1.ArrayItemTemplate(dom_1.document, { string: string_1.StringTemplate(dom_1.document) });
                it('creates', () => {
                    const item = template({});
                    assert.strictEqual(item.localName, 'li');
                });
                it('creates child', () => {
                    const item = array_item_1.ArrayItemTemplate(dom_1.document, { string: string_1.StringTemplate(dom_1.document) })({ type: 'string' });
                    assert.strictEqual(item.childElementCount, 1);
                });
                it('ignores type on child that has no template', () => {
                    const item = array_item_1.ArrayItemTemplate(dom_1.document)({ type: 'string' });
                    assert.strictEqual(item.childElementCount, 0);
                });
            });
        });
    });
});
//# sourceMappingURL=containers.js.map