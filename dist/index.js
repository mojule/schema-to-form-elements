"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaToFormElements = (templates) => {
    const schemaToFormElements = (schema, name = '', value) => {
        if (typeof schema.type !== 'string')
            throw Error('Expected type to be a string');
        if (!schemaTypeNames.includes(schema.type))
            throw Error(`Expected type to be one of ${schemaTypeNames}`);
        const template = templates[schema.type];
        if (!template)
            throw Error(`No template found for ${schema.type}`);
        return template(schema, name, value);
    };
    return schemaToFormElements;
};
const schemaTypeNames = [
    'array', 'boolean', 'number', 'integer', 'object', 'string'
];
//# sourceMappingURL=index.js.map