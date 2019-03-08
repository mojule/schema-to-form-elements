"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDecorator = (_document, inputTemplate) => {
    const typeDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (typeof schema.type === 'string')
            name = `${name}__${schema.type}`;
        return inputTemplate(schema, name, value, isRequired);
    };
    return typeDecorator;
};
//# sourceMappingURL=type.js.map