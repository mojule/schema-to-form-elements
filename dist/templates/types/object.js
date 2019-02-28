"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTemplate = (document, templates = {}) => {
    const objectTemplate = (schema, name = '', defaultValue) => {
        const container = document.createElement('div');
        container.title = schema.title || 'Object';
        if (!schema.properties)
            return container;
        Object.keys(schema.properties).forEach(key => {
            const childSchema = schema.properties[key];
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childDefaultValue = undefined;
            if (typeof defaultValue === 'object') {
                childDefaultValue = defaultValue[key];
            }
            const childName = name ? `${name}[${key}]` : key;
            const editor = template(childSchema, childName, childDefaultValue);
            container.appendChild(editor);
        });
        return container;
    };
    return objectTemplate;
};
//# sourceMappingURL=object.js.map