"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_list_1 = require("../api/array-list");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.MutableArrayListDecorator = (document, Event, arrayList, templates) => {
    const mutableArrayListDecorator = (schema = {}, name = '', value) => {
        const container = arrayList(schema, name, value);
        if (!schema.items ||
            Array.isArray(schema.items) ||
            typeof schema.items.type !== 'string')
            return container;
        const api = array_list_1.ArrayListApi(document, container, schema, templates);
        const title = `Add ${utils_1.getTitle(schema.items, '', 'Item')}`;
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.innerHTML = title;
        addButton.dataset.action = 'array-list-add';
        container.appendChild(addButton);
        container.addEventListener('click', e => {
            const target = e.target;
            if (target.dataset.action === 'array-list-add') {
                e.stopPropagation();
                api.add();
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (target.dataset.action === 'array-list-delete') {
                e.stopPropagation();
                const li = target.closest('li');
                // can't throw errors in event handlers, no way to catch them
                // when using dispatchEvent, so throwing makes this untestable
                if (!li)
                    return;
                const ol = li.parentNode;
                const index = Array.from(ol.children).indexOf(li);
                api.remove(index);
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        return container;
    };
    return mutableArrayListDecorator;
};
exports.MutableArrayItemDecorator = (document, arrayItem) => {
    const mutableArrayItemDecorator = (schema = {}, name = '', value) => {
        const item = arrayItem(schema, name, value);
        const title = `Delete ${utils_1.getTitle(schema, name, 'Item')}`;
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerHTML = title;
        deleteButton.dataset.action = 'array-list-delete';
        item.appendChild(deleteButton);
        return item;
    };
    return mutableArrayItemDecorator;
};
//# sourceMappingURL=mutable-array-list.js.map