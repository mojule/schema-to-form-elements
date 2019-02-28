"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("./ensure-default-dependencies");
exports.ArrayItemsTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const arrayItemsEditor = (schema) => {
        const container = deps.container(schema);
        container.dataset.title = schema.title || 'Array Items';
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        if (!(childSchema.type in deps))
            return container;
        const templateElement = document.createElement('template');
        const template = deps[childSchema.type];
        const editor = template(childSchema);
        container.appendChild(templateElement);
        templateElement.content.appendChild(editor.cloneNode(true));
        const count = schema.maxItems || schema.minItems;
        if (!count)
            return container;
        const list = document.createElement('ol');
        for (let key = 0; key < count; key++) {
            const li = document.createElement('li');
            const editorItem = editor.cloneNode(true);
            editorItem.dataset.key = String(key);
            li.appendChild(editorItem);
            list.appendChild(li);
        }
        container.appendChild(list);
        return container;
    };
    return arrayItemsEditor;
};
//# sourceMappingURL=array-items.js.map