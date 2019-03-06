"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./types/array");
const boolean_1 = require("./types/boolean");
const number_1 = require("./types/number");
const object_1 = require("./types/object");
const string_1 = require("./types/string");
const fieldset_1 = require("./decorators/fieldset");
const format_1 = require("./decorators/format");
const label_1 = require("./decorators/label");
const mutable_array_list_1 = require("./decorators/mutable-array-list");
const array_list_1 = require("./array-list");
const array_item_1 = require("./array-item");
exports.FormTemplates = (document) => {
    const templates = {};
    templates.array = fieldset_1.FieldsetDecorator(document, array_1.ArrayTemplate(document, templates));
    templates.boolean = label_1.LabelDecorator(document, boolean_1.BooleanTemplate(document), true);
    templates.number = label_1.LabelDecorator(document, number_1.NumberTemplate(document));
    templates.integer = templates.number;
    templates.object = fieldset_1.FieldsetDecorator(document, object_1.ObjectTemplate(document, templates));
    templates.string = label_1.LabelDecorator(document, format_1.FormatDecorator(document, {
        string: string_1.StringTemplate(document),
        multiline: string_1.StringTemplate(document, true)
    }));
    return templates;
};
exports.ClientFormTemplates = (document) => {
    const templates = exports.FormTemplates(document);
    templates.arrayList = mutable_array_list_1.MutableArrayListDecorator(document, array_list_1.ArrayListTemplate(document, templates), templates);
    templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(document, array_item_1.ArrayItemTemplate(document, templates));
    return templates;
};
//# sourceMappingURL=index.js.map