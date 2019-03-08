"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("../types/array/array-item");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.ArrayListApi = (document, container, schema, templates) => {
    const list = container.querySelector('ol');
    if (!list)
        throw Error('ArrayListApi: container is missing OL');
    if (!schema.items || Array.isArray(schema.items))
        throw Error('ArrayListApi: schema.items should be a schema');
    const childSchema = schema.items;
    if (typeof childSchema.type !== 'string')
        throw Error('ArrayListApi: schema.items.type should be a string');
    const template = templates[childSchema.type];
    if (!template)
        throw Error(`ArrayListApi: missing template ${childSchema.type}`);
    const name = container.dataset.name || '';
    const count = () => list.childElementCount;
    const clear = () => { list.innerHTML = ''; };
    const add = (value) => {
        let arrayItem = templates.arrayItem;
        if (!arrayItem) {
            arrayItem = array_item_1.ArrayItemTemplate(document, templates);
        }
        const key = count();
        const childName = utils_1.getChildName(name, count());
        const li = arrayItem(childSchema, childName, value);
        list.appendChild(li);
        return key;
    };
    const remove = (index) => {
        if (index >= count())
            throw Error('ArrayListApi: remove index out of bounds');
        const previousCount = count();
        list.children[index].remove();
        renumber(previousCount, index + 1);
    };
    const renumber = (previousCount, from) => {
        const name = container.dataset.name || '';
        for (let i = from; i < previousCount; i++) {
            const oldName = utils_1.getChildName(name, i);
            const newName = utils_1.getChildName(name, i - 1);
            const targets = Array.from(list.querySelectorAll('[name]'));
            targets.forEach(target => {
                if (target.name.startsWith(oldName)) {
                    target.name = target.name.replace(oldName, newName);
                }
            });
        }
    };
    return {
        get count() {
            return count();
        },
        clear,
        add,
        remove
    };
};
//# sourceMappingURL=array-list.js.map