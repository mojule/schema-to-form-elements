"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_list_1 = require("../api/array-list");
const utils_1 = require("../utils");
exports.MutableArrayList = (document, arrayList, arrayItem, templates = {}) => {
    const parentMap = new Map();
    const mutableArrayListDecorator = (schema, name = '', value) => {
        const container = arrayList(schema, name, value);
        if (!schema.items || Array.isArray(schema.items))
            throw Error('MutableArrayList: expected schema.items to be JSON Schema');
        parentMap.set(schema.items, schema);
        const api = array_list_1.ArrayListApi(container, schema, templates);
        const title = `Add ${utils_1.getTitle(schema.items, '', 'Item')}`;
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.innerHTML = title;
        addButton.dataset.action = 'array-list-add';
        container.appendChild(addButton);
        container.addEventListener('click', e => {
            if (!(e.target instanceof HTMLButtonElement))
                return;
            if (e.target.dataset.action === 'array-list-add') {
                e.stopPropagation();
                api.add();
            }
            if (e.target.dataset.action === 'array-list-delete') {
                e.stopPropagation();
                const li = e.target.closest('li');
                if (!li)
                    throw Error('MutableArrayList: expected delete action to have an LI parent');
                const index = Array.from(li.parentNode.children).indexOf(li);
                console.log(`remove ${index}`);
                api.remove(index);
            }
        });
        return container;
    };
    const mutableArrayItemDecorator = (schema, name = '', value) => {
        const item = arrayItem(schema, name, value);
        const title = `Delete ${utils_1.getTitle(schema, name, 'Item')}`;
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerHTML = title;
        deleteButton.dataset.action = 'array-list-delete';
        item.appendChild(deleteButton);
        return item;
    };
    return {
        mutableArrayListDecorator, mutableArrayItemDecorator
    };
};
//# sourceMappingURL=mutable-array-list.js.map