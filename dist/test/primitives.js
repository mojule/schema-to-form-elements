"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const dom_1 = require("../server/dom");
const __1 = require("..");
describe('schema-forms', () => {
    describe('primitives', () => {
        describe('creates input from primitive type', () => {
            const expectInputType = {
                boolean: 'checkbox',
                number: 'number',
                integer: 'number',
                string: 'text'
            };
            const expectTitle = {
                boolean: 'Boolean',
                number: 'Number',
                integer: 'Integer',
                string: 'String'
            };
            const expectValue = {
                boolean: true,
                number: '1.1',
                integer: '1',
                string: 'foo'
            };
            const templates = {
                boolean: __1.BooleanTemplate(dom_1.document),
                number: __1.NumberTemplate(dom_1.document),
                integer: __1.NumberTemplate(dom_1.document),
                string: __1.StringTemplate(dom_1.document)
            };
            const values = {
                boolean: true,
                number: 1.1,
                integer: 1,
                string: 'foo'
            };
            const valueProperties = {
                boolean: 'checked',
                number: 'defaultValue',
                integer: 'defaultValue',
                string: 'defaultValue'
            };
            Object.keys(expectInputType).forEach(type => {
                const inputType = expectInputType[type];
                const inputTitle = expectTitle[type];
                const inputValue = expectValue[type];
                describe(`input[type="${inputType}"] from ${type} schema`, () => {
                    it('expected type', () => {
                        const input = templates[type]();
                        assert.strictEqual(input.type, inputType);
                    });
                    it('default title', () => {
                        const input = templates[type]({ type });
                        assert.strictEqual(input.title, inputTitle);
                    });
                    it('name', () => {
                        const input = templates[type]({}, type);
                        assert.strictEqual(input.name, type);
                    });
                    it('value', () => {
                        const input = templates[type]({}, type, values[type]);
                        assert.strictEqual(input[valueProperties[type]], inputValue);
                    });
                    it('value from default', () => {
                        const input = templates[type]({ default: values[type] }, type);
                        assert.strictEqual(input[valueProperties[type]], inputValue);
                    });
                    if (type === 'boolean') {
                        it('value is false', () => {
                            const input = templates[type]({}, type, false);
                            assert.strictEqual(input[valueProperties[type]], false);
                        });
                        it('value from default is false', () => {
                            const input = templates[type]({ default: false }, type);
                            assert.strictEqual(input[valueProperties[type]], false);
                        });
                    }
                    else {
                        it('required', () => {
                            const input = templates[type]({}, type, values[type], true);
                            assert(input.required);
                        });
                    }
                    if (type === 'number' || type === 'integer') {
                        it('step matches multipleOf', () => {
                            const input = templates[type]({ multipleOf: 2 });
                            assert.strictEqual(input.step, '2');
                        });
                        it('min matches minimum', () => {
                            const input = templates[type]({ minimum: 2 });
                            assert.strictEqual(input.min, '2');
                        });
                        it('max matches maximum', () => {
                            const input = templates[type]({ type, maximum: 2 });
                            assert.strictEqual(input.max, '2');
                        });
                        it('range', () => {
                            const input = __1.NumberTemplate(dom_1.document, true)();
                            assert.strictEqual(input.type, 'range');
                        });
                    }
                    if (type === 'integer') {
                        it('step is 1 if no multipleOf', () => {
                            const input = templates[type]({ type: 'integer' });
                            assert.strictEqual(input.step, '1');
                        });
                    }
                    if (type === 'string') {
                        it('multiline', () => {
                            const input = __1.StringTemplate(dom_1.document, true)();
                            assert.strictEqual(input.localName, 'textarea');
                        });
                        it('pattern', () => {
                            const input = templates[type]({ pattern: '.*' });
                            assert.strictEqual(input.pattern, '.*');
                        });
                        it('minLength', () => {
                            const input = templates[type]({ minLength: 2 });
                            assert.strictEqual(input.minLength, 2);
                        });
                        it('maxLength', () => {
                            const input = templates[type]({ maxLength: 2 });
                            assert.strictEqual(input.maxLength, 2);
                        });
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=primitives.js.map