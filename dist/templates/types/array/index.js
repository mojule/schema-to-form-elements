"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("./tuple");
const array_list_1 = require("./array-list");
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema = {}, name = '', value) => {
        if (typeof value === 'undefined' &&
            Array.isArray(schema.default)) {
            value = schema.default;
        }
        if (Array.isArray(schema.items)) {
            if (templates.tuple) {
                return templates.tuple(schema, name, value);
            }
            return tuple_1.TupleTemplate(document, templates)(schema, name, value);
        }
        if (templates.arrayList) {
            return templates.arrayList(schema, name, value);
        }
        return array_list_1.ArrayListTemplate(document, templates)(schema, name, value);
    };
    return arrayTemplate;
};
//# sourceMappingURL=index.js.map