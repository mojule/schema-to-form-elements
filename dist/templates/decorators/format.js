"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDecorator = (_document, stringTemplate, multilineTemplate, formatToType = exports.defaultFormatToType) => {
    const formatDecorator = (schema, name = '', defaultValue) => {
        if (schema.format === 'multiline') {
            return multilineTemplate(schema, name, defaultValue);
        }
        const editor = stringTemplate(schema, name, defaultValue);
        if (typeof schema.format === 'string') {
            const input = (editor.matches('input') ? editor :
                editor.querySelector('input'));
            if (!input)
                throw Error('formatDecorator could not find an input element!');
            const format = formatToType.get(schema.format) || schema.format;
            input.type = format;
        }
        return editor;
    };
    return formatDecorator;
};
exports.defaultFormatToType = new Map();
exports.defaultFormatToType.set('date-time', 'datetime-local');
exports.defaultFormatToType.set('uri', 'url');
//# sourceMappingURL=format.js.map