"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanTemplate = (document) => {
    const booleanTemplate = (schema, name = '', defaultValue) => {
        const editor = document.createElement('input');
        editor.type = 'checkbox';
        editor.title = schema.title || 'Boolean';
        if (name)
            editor.name = name;
        if (typeof defaultValue === 'boolean') {
            editor.checked = defaultValue;
        }
        else if (typeof schema.default === 'boolean') {
            editor.checked = schema.default;
        }
        return editor;
    };
    return booleanTemplate;
};
//# sourceMappingURL=boolean.js.map