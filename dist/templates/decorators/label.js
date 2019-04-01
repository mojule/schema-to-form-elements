"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.LabelDecorator = (document, inputTemplate, isSuffix = false) => {
    const labelDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const editor = inputTemplate(schema, name, value, isRequired);
        const input = (editor.matches('input') ? editor :
            editor.querySelector('input'));
        if (input && input.type === 'hidden')
            return editor;
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML =
            `${utils_1.getTitle(schema, name, 'Input')}${isRequired ? '*' : ''}`;
        if (isSuffix) {
            label.appendChild(editor);
            label.appendChild(span);
        }
        else {
            label.appendChild(span);
            label.appendChild(editor);
        }
        return label;
    };
    return labelDecorator;
};
//# sourceMappingURL=label.js.map