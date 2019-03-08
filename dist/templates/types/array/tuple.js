"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Tuple');
        if (name)
            container.dataset.name = name;
        if (!Array.isArray(schema.items))
            return container;
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
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
            const childName = utils_1.getChildName(name, key);
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};
//# sourceMappingURL=tuple.js.map