"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringTextAreaTemplate = (document) => {
    const stringTextAreaTemplate = (schema) => {
        const editor = document.createElement('textarea');
        editor.dataset.title = schema.title || 'Multiline String';
        if (typeof schema.type === 'string')
            editor.dataset.type = schema.type;
        if (schema.default)
            editor.defaultValue = String(schema.default);
        if (schema.minLength !== undefined) {
            editor.minLength = schema.minLength;
        }
        if (schema.maxLength !== undefined) {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTextAreaTemplate;
};
//# sourceMappingURL=string-textarea.js.map