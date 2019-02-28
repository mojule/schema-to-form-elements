"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canLabel = (element) => ['input', 'textarea'].includes(element.localName) &&
    !element.closest('label');
exports.LabelDecorator = (document) => {
    const labelDecorator = (element) => {
        if (!canLabel(element))
            return element;
        const { title, type } = element.dataset;
        if (!title)
            return element;
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML = title;
        if (type === 'boolean') {
            label.appendChild(element);
            label.appendChild(span);
        }
        else {
            label.appendChild(span);
            label.appendChild(element);
        }
        return label;
    };
    return labelDecorator;
};
//# sourceMappingURL=label-decorator.js.map