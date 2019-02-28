"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("../ensure-default-dependencies");
exports.NumberTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const numberTemplate = (schema) => {
        const editor = deps.input(schema);
        editor.type = 'number';
        editor.dataset.title = schema.title || 'Number';
        if (schema.default)
            editor.defaultValue = String(schema.default);
        if (schema.type === 'integer') {
            editor.step = String(schema.multipleOf || 1);
        }
        else if (schema.multipleOf) {
            editor.step = String(schema.multipleOf);
        }
        if ('minimum' in schema) {
            editor.min = String(schema.minimum);
        }
        if ('maximum' in schema) {
            editor.max = String(schema.maximum);
        }
        return editor;
    };
    return numberTemplate;
};
//# sourceMappingURL=number.js.map