"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema, name = '', defaultValue) => {
        if (typeof defaultValue === 'undefined' &&
            Array.isArray(schema.default)) {
            defaultValue = schema.default;
        }
        if (Array.isArray(schema.items) && templates.tuple) {
            return templates.tuple(schema, name, defaultValue);
        }
        if (schema.items && templates.arrayItems) {
            return templates.arrayItems(schema, name, defaultValue);
        }
        const container = document.createElement('div');
        container.title = schema.title || 'Array';
        if (name)
            container.dataset.name = name;
        return container;
    };
    return arrayTemplate;
};
//# sourceMappingURL=array.js.map