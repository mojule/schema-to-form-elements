"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemsTemplate = (document, templates = {}, initialCount) => {
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
        let count = (Array.isArray(defaultValue) ? defaultValue.length :
            typeof initialCount === 'number' ? initialCount :
                schema.maxItems || schema.minItems);
        if (typeof schema.maxItems === 'number' &&
            typeof count === 'number' &&
            count > schema.maxItems) {
            count = schema.maxItems;
        }
        if (typeof count === 'undefined')
            return container;
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