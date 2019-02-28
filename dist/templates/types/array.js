"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("../ensure-default-dependencies");
exports.ArrayTemplate = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const arrayTemplate = (schema) => {
        const container = deps.container(schema);
        container.dataset.title = schema.title || 'Array';
        if (Array.isArray(schema.items) && deps.tuple) {
            return deps.tuple(schema);
        }
        if (schema.items && deps.arrayItems) {
            return deps.arrayItems(schema);
        }
        return container;
    };
    return arrayTemplate;
};
//# sourceMappingURL=array.js.map