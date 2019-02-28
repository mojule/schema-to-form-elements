"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("./ensure-default-dependencies");
exports.TupleTemplate = (document, options = {}) => {
    const opts = ensure_default_dependencies_1.ensureDefaultDependencies(document, options);
    const tupleTemplate = (schema) => {
        const container = opts.container(schema);
        container.dataset.title = schema.title || 'Tuple';
        if (!Array.isArray(schema.items))
            return container;
        schema.items.forEach((childSchema, key) => {
            if (typeof childSchema.type !== 'string')
                return;
            if (!(childSchema.type in opts))
                return;
            const template = opts[childSchema.type];
            const editor = template(childSchema);
            editor.dataset.key = String(key);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};
//# sourceMappingURL=tuple.js.map