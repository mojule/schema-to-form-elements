"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDecorator = (_document, stringTemplates, formatToTemplateKey = new Map(), formatToTypeAttribute = exports.defaultFormatToType) => {
    const formatDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const stringTemplate = stringTemplates.string;
        let format;
        if (typeof schema.format !== 'string') {
            return stringTemplate(schema, name, value, isRequired);
        }
        format = formatToTemplateKey.get(schema.format) || schema.format;
        if (typeof stringTemplates[format] !== 'undefined') {
            return stringTemplates[format](schema, name, value, isRequired);
        }
        const editor = stringTemplate(schema, name, value, isRequired);
        const input = (editor.matches('input') ? editor :
            editor.querySelector('input'));
        if (!input)
            throw Error('formatDecorator could not find an input element!');
        format = formatToTypeAttribute.get(schema.format) || schema.format;
        input.type = format;
        return editor;
    };
    return formatDecorator;
};
exports.defaultFormatToType = new Map();
exports.defaultFormatToType.set('date-time', 'datetime-local');
exports.defaultFormatToType.set('uri', 'url');
//# sourceMappingURL=format.js.map