"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputTemplate = (document) => {
    const inputTemplate = (schema) => {
        const editor = document.createElement('input');
        if (typeof schema.type === 'string')
            editor.dataset.type = schema.type;
        return editor;
    };
    return inputTemplate;
};
//# sourceMappingURL=input.js.map