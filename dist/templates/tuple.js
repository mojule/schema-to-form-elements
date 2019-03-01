"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema, name = '', defaultValue) => {
        const container = document.createElement('div');
        container.title = schema.title || 'Tuple';
        if (!Array.isArray(schema.items))
            return container;
        schema.items.forEach((childSchema, key) => {
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childDefaultValue = undefined;
            if (Array.isArray(defaultValue)) {
                childDefaultValue = defaultValue[key];
            }
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const editor = template(childSchema, childName, childDefaultValue);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};
//# sourceMappingURL=tuple.js.map