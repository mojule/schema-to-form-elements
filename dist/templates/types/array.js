"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayTemplate = (document, templates) => {
    const arrayTemplate = (schema, name = '', defaultValue) => {
        if (Array.isArray(schema.items) && templates.tuple) {
            return templates.tuple(schema, name, defaultValue);
        }
        if (schema.items && templates.arrayItems) {
            return templates.arrayItems(schema, name, defaultValue);
        }
        const container = document.createElement('div');
        container.title = schema.title || 'Array';
        return container;
    };
    return arrayTemplate;
};
//# sourceMappingURL=array.js.map