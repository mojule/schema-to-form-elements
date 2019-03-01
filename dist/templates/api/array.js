"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayApi = (document, templates = {}) => {
    const { arrayItems } = templates;
    if (!arrayItems)
        throw Error('ArrayApi: missing template arrayItems');
    const api = {};
    const Api = (container, schema, name = '', defaultValue) => {
        const list = container.querySelector('ol');
        if (!list)
            throw Error('ArrayApi: arrayItems did not create an ol child');
        if (!schema.items || Array.isArray(schema.items))
            throw Error('ArrayApi: schema.items should be a schema');
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            throw Error('ArrayApi: schema.items.type should be a string');
        const template = templates[childSchema.type];
        if (!template)
            throw Error(`ArrayApi: missing template ${childSchema.type}`);
        const count = () => list.childElementCount;
        const clear = () => list.innerHTML = '';
        const add = (defaultValue) => {
            const key = count();
            const li = document.createElement('li');
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const editorItem = template(childSchema, childName, defaultValue);
            li.appendChild(editorItem);
            list.appendChild(li);
            return key;
        };
        const remove = (index) => {
            if (index >= count())
                throw Error('ArrayApi: remove index out of bounds');
            const previousCount = count();
            list.children[index].remove();
            renumber(previousCount, index + 1);
        };
        const renumber = (previousCount, from) => {
            for (let i = from; i < previousCount; i++) {
                const oldName = `${name}[${i}]`;
                const newName = `${name}[${i - 1}]`;
                const targets = Array.from(list.querySelectorAll(`input[name]`));
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
            get arraySchema() {
                return schema;
            },
            get childSchema() {
                return schema.items;
            },
            get name() {
                return name;
            },
            get defaultValue() {
                return defaultValue;
            },
            clear, add, remove
        };
    };
    const arrayApiDecorator = (schema, name = '', defaultValue) => {
        const container = arrayItems(schema, name, defaultValue);
        if (name in api)
            throw Error(`ArrayApi: name ${name} already exists, create a new API for each form you generate`);
        api[name] = Api(container, schema, name, defaultValue);
        return container;
    };
    return { arrayApiDecorator, api };
};
//# sourceMappingURL=array.js.map