"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("../ensure-default-dependencies");
exports.StringTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const stringTemplate = (schema) => {
        if (schema.format === 'multiline' && deps.stringTextArea)
            return deps.stringTextArea(schema);
        const editor = deps.input(schema);
        editor.type = 'text';
        editor.dataset.title = schema.title || 'String';
        if (typeof schema.type === 'string')
            editor.dataset.type = schema.type;
        if (schema.default)
            editor.defaultValue = String(schema.default);
        if (schema.pattern) {
            editor.pattern = schema.pattern;
        }
        if (schema.minLength !== undefined) {
            editor.minLength = schema.minLength;
        }
        if (schema.maxLength !== undefined) {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTemplate;
};
//# sourceMappingURL=string.js.map