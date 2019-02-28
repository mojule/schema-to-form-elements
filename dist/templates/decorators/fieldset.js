"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldsetDecorator = (document, template, useLegend = true) => {
    const fieldsetDecorator = (schema, name = '', defaultValue) => {
        const editor = template(schema, name, defaultValue);
        const { title } = schema;
        const fieldset = document.createElement('fieldset');
        if (title && useLegend) {
            const legend = document.createElement('legend');
            legend.innerHTML = title;
            fieldset.appendChild(legend);
        }
        fieldset.appendChild(editor);
        return fieldset;
    };
    return fieldsetDecorator;
};
//# sourceMappingURL=fieldset.js.map