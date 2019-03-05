"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayListApi = (container, schema, templates = {}) => {
    const list = container.querySelector('ol');
    if (!list)
        throw Error('ArrayListApi: arrayList did not create an ol child');
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
        const arrayItem = templates.arrayItem;
        if (!arrayItem)
            throw Error(`ArrayListApi: missing template arrayItem`);
        const key = count();
        const childName = name ? `${name}[${key}]` : `[${key}]`;
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
            const oldName = `${name}[${i}]`;
            const newName = `${name}[${i - 1}]`;
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