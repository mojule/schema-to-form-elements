"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemsTemplate = (document, templates = {}) => {
    const arrayItemsEditor = (schema, name = '', defaultValue) => {
        const container = document.createElement('div');
        container.title = schema.title || 'Array Items';
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        const template = templates[childSchema.type];
        if (!template)
            return container;
        const hasMaxItems = typeof schema.maxItems === 'number';
        const hasMinItems = typeof schema.minItems === 'number';
        let count = (Array.isArray(defaultValue) ? defaultValue.length :
            hasMaxItems ? schema.maxItems :
                hasMinItems ? schema.minItems :
                    0);
        if (hasMaxItems && count > schema.maxItems) {
            count = schema.maxItems;
        }
        if (hasMinItems && count < schema.minItems) {
            count = schema.minItems;
        }
        const list = document.createElement('ol');
        for (let key = 0; key < count; key++) {
            const li = document.createElement('li');
            let childDefaultValue = undefined;
            if (Array.isArray(defaultValue)) {
                childDefaultValue = defaultValue[key];
            }
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const editorItem = template(childSchema, childName, childDefaultValue);
            li.appendChild(editorItem);
            list.appendChild(li);
        }
        container.appendChild(list);
        return container;
    };
    return arrayItemsEditor;
};
//# sourceMappingURL=array-items.js.map