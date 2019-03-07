"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemTemplate = (document, templates = {}) => {
    const arrayItemEditor = (schema = {}, name = '', value) => {
        const li = document.createElement('li');
        if (typeof schema.type !== 'string')
            return li;
        const template = templates[schema.type];
        if (!template)
            return li;
        const editorItem = template(schema, name, value);
        li.appendChild(editorItem);
        return li;
    };
    return arrayItemEditor;
};
//# sourceMappingURL=array-item.js.map