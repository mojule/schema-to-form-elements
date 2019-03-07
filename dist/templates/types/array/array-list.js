"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("./array-item");
const utils_1 = require("../../utils");
exports.ArrayListTemplate = (document, templates = {}) => {
    const arrayListEditor = (schema = {}, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Array List');
        if (name)
            container.dataset.name = name;
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        const template = templates[childSchema.type];
        if (!template)
            return container;
        const itemTemplate = (templates.arrayItem || array_item_1.ArrayItemTemplate(document, templates));
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
        const hasMaxItems = typeof schema.maxItems === 'number';
        const hasMinItems = typeof schema.minItems === 'number';
        let count = (Array.isArray(value) ? value.length :
            hasMaxItems ? schema.maxItems :
                hasMinItems ? schema.minItems :
                    1);
        if (hasMaxItems && count > schema.maxItems) {
            count = schema.maxItems;
        }
        if (hasMinItems && count < schema.minItems) {
            count = schema.minItems;
        }
        const list = document.createElement('ol');
        container.appendChild(list);
        for (let key = 0; key < count; key++) {
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = utils_1.getChildName(name, key);
            const li = itemTemplate(childSchema, childName, childValue);
            list.appendChild(li);
        }
        return container;
    };
    return arrayListEditor;
};
//# sourceMappingURL=array-list.js.map