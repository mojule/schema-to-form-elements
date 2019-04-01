"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.SelectDecorator = (document, stringTemplate, predicate = (_schema) => true) => {
    const selectDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (!Array.isArray(schema.enum) || !predicate(schema))
            return stringTemplate(schema, name, value, isRequired);
        if (!schema.enum.every(value => typeof value === 'string'))
            throw Error('Expected enum to be an array of strings');
        const enumValues = schema.enum;
        const editor = document.createElement('select');
        editor.title = utils_1.getTitle(schema, name, 'String');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        enumValues.forEach((enumValue, i) => {
            const option = document.createElement('option');
            const title = (schema['_enumTitles'] && schema['_enumTitles'][i] ?
                schema['_enumTitles'][i] :
                enumValue);
            option.value = enumValue;
            option.innerHTML = title;
            if (typeof value === 'string') {
                option.selected = enumValue === value;
            }
            else if (typeof schema.default === 'string') {
                option.selected = enumValue === schema.default;
            }
            editor.appendChild(option);
        });
        return editor;
    };
    return selectDecorator;
};
//# sourceMappingURL=select.js.map