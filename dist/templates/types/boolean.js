"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.BooleanTemplate = (document) => {
    const booleanTemplate = (schema = {}, name = '', value) => {
        const editor = document.createElement('input');
        editor.type = 'checkbox';
        editor.title = utils_1.getTitle(schema, name, 'Boolean');
        if (Array.isArray(schema.enum) &&
            schema.enum.length === 1 &&
            schema.enum[0] === true)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'boolean') {
            if (value)
                editor.setAttribute('checked', '');
        }
        else if (typeof schema.default === 'boolean') {
            if (schema.default)
                editor.setAttribute('checked', '');
        }
        return editor;
    };
    return booleanTemplate;
};
//# sourceMappingURL=boolean.js.map