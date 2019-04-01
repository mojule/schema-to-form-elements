"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstDecorator = (_document, stringOrNumberTemplate) => {
    const constDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (Array.isArray(schema.enum) && schema.enum.length === 1) {
            const editor = stringOrNumberTemplate(schema, name, schema.enum[0]);
            const input = (editor.matches('input') ? editor :
                editor.querySelector('input'));
            if (!input)
                return editor;
            if (schema.format === 'hidden') {
                input.type = 'hidden';
                return input;
            }
            input.readOnly = true;
            return input;
        }
        return stringOrNumberTemplate(schema, name, value, isRequired);
    };
    return constDecorator;
};
//# sourceMappingURL=const.js.map