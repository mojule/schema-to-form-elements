"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("../ensure-default-dependencies");
exports.BooleanTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const booleanTemplate = (schema) => {
        const editor = deps.input(schema);
        editor.type = 'checkbox';
        editor.dataset.title = schema.title || 'Boolean';
        if (schema.default)
            editor.checked = true;
        return editor;
    };
    return booleanTemplate;
};
//# sourceMappingURL=boolean.js.map