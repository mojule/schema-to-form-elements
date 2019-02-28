"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateAll = (element, ...decorators) => {
    decorators.forEach(decorator => {
        element = decorator(element);
    });
    return element;
};
//# sourceMappingURL=decorate-all.js.map