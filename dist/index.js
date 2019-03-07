"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./templates/api/array-list"));
__export(require("./templates/decorators/fieldset"));
__export(require("./templates/decorators/format"));
__export(require("./templates/decorators/label"));
__export(require("./templates/decorators/mutable-array-list"));
__export(require("./templates/types/array"));
__export(require("./templates/types/boolean"));
__export(require("./templates/types/number"));
__export(require("./templates/types/object"));
__export(require("./templates/types/string"));
__export(require("./templates/types/array/array-item"));
__export(require("./templates/types/array/array-list"));
__export(require("./templates/types/array/tuple"));
__export(require("./templates/types"));
__export(require("./templates/utils"));
__export(require("./templates"));
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