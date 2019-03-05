"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("../tuple");
const array_list_1 = require("../array-list");
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema, name = '', value) => {
        if (typeof value === 'undefined' &&
            Array.isArray(schema.default)) {
            value = schema.default;
        }
        const template = (Array.isArray(schema.items) ?
            templates.tuple || tuple_1.TupleTemplate(document, templates) :
            templates.arrayList || array_list_1.ArrayListTemplate(document, templates));
        return template(schema, name, value);
    };
    return arrayTemplate;
};
//# sourceMappingURL=array.js.map