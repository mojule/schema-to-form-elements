"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerTemplate = (document) => {
    const containerTemplate = (schema) => {
        const container = document.createElement('div');
        container.dataset.title = schema.title || 'Container';
        container.dataset.container = '';
        if (typeof schema.type === 'string')
            container.dataset.type = schema.type;
        return container;
    };
    return containerTemplate;
};
//# sourceMappingURL=container.js.map