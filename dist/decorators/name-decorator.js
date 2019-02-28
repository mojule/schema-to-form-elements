"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canName = (element) => ['input', 'textarea'].includes(element.localName);
exports.NameDecorator = (_document) => {
    const nameDecorator = (element) => {
        if (!canName(element))
            return element;
        let name = '';
        let keyEl = element.closest('[data-key]');
        while (keyEl) {
            const { key } = keyEl.dataset;
            if (key)
                name = `/${key}${name}`;
            keyEl = element.closest('[data-key]');
        }
        element.name = name;
        return element;
    };
    return nameDecorator;
};
//# sourceMappingURL=name-decorator.js.map