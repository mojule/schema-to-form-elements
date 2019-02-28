"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringTemplate = (document, isMultiline = false) => {
    const stringTemplate = (schema, name = '', defaultValue) => {
        let editor;
        if (isMultiline) {
            editor = document.createElement('textarea');
        }
        else {
            editor = document.createElement('input');
            editor.type = 'text';
            if (schema.pattern) {
                editor.pattern = schema.pattern;
            }
        }
        editor.title = schema.title || 'String';
        if (name)
            editor.name = name;
        if (typeof defaultValue === 'string') {
            editor.defaultValue = defaultValue;
        }
        else if (typeof schema.default === 'string') {
            editor.defaultValue = schema.default;
        }
        if (schema.minLength !== undefined) {
            editor.minLength = schema.minLength;
        }
        if (schema.maxLength !== undefined) {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTemplate;
};
//# sourceMappingURL=string.js.map