"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Tuple');
        if (!Array.isArray(schema.items))
            return container;
        schema.items.forEach((childSchema, key) => {
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const editor = template(childSchema, childName, childValue);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};
//# sourceMappingURL=tuple.js.map