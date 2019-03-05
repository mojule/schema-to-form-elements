"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
exports.SchemaToFormElements = (document, templates = {}) => {
    templates = Object.assign({}, templates_1.FormTemplates(document), templates);
    const schemaToFormElements = (schema, name = '', value) => {
        if (typeof schema.type !== 'string')
            throw Error('Expected schema.type to be a string');
        const template = templates[schema.type];
        if (!template)
            throw Error(`No template found for ${schema.type}`);
        return template(schema, name, value);
    };
    return schemaToFormElements;
};
//# sourceMappingURL=index.js.map