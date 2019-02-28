"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("../ensure-default-dependencies");
exports.ObjectTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const objectTemplate = (schema) => {
        const container = deps.container(schema);
        container.dataset.title = schema.title || 'Object';
        if (!schema.properties)
            return container;
        Object.keys(schema.properties).forEach(key => {
            const childSchema = schema.properties[key];
            if (typeof childSchema.type !== 'string')
                return;
            if (!(childSchema.type in deps))
                return;
            const template = deps[childSchema.type];
            const editor = template(childSchema);
            editor.dataset.key = key;
            container.appendChild(editor);
        });
        return container;
    };
    return objectTemplate;
};
//# sourceMappingURL=object.js.map