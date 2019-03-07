"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.NumberTemplate = (document, isRange = false) => {
    const numberTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const editor = document.createElement('input');
        editor.type = isRange ? 'range' : 'number';
        editor.title = utils_1.getTitle(schema, name, schema.type === 'integer' ? 'Integer' : 'Number');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'number') {
            editor.defaultValue = String(value);
        }
        else if (typeof schema.default === 'number') {
            editor.defaultValue = String(schema.default);
        }
        if (typeof schema.multipleOf === 'number') {
            editor.step = String(schema.multipleOf);
        }
        else if (schema.type === 'integer') {
            editor.step = '1';
        }
        if (typeof schema.minimum === 'number') {
            editor.min = String(schema.minimum);
        }
        if (typeof schema.maximum === 'number') {
            editor.max = String(schema.maximum);
        }
        return editor;
    };
    return numberTemplate;
};
//# sourceMappingURL=number.js.map