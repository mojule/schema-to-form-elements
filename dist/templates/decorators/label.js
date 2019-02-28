"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelDecorator = (document, template, isSuffix = false) => {
    const labelDecorator = (schema, name = '', defaultValue) => {
        const editor = template(schema, name, defaultValue);
        const { title } = schema;
        if (!title)
            return editor;
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML = title;
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