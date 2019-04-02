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
const array_list_1 = require("./types/array/array-list");
const array_item_1 = require("./types/array/array-item");
const select_1 = require("./decorators/select");
const const_1 = require("./decorators/const");
exports.ServerFormTemplates = (document) => {
    const templates = {};
    templates.array = fieldset_1.FieldsetDecorator(document, array_1.ArrayTemplate(document, templates));
    templates.boolean = label_1.LabelDecorator(document, boolean_1.BooleanTemplate(document), true);
    templates.number = label_1.LabelDecorator(document, const_1.ConstDecorator(document, number_1.NumberTemplate(document)));
    templates.integer = templates.number;
    templates.object = fieldset_1.FieldsetDecorator(document, object_1.ObjectTemplate(document, templates));
    templates.string = label_1.LabelDecorator(document, const_1.ConstDecorator(document, select_1.SelectDecorator(document, format_1.FormatDecorator(document, {
        string: string_1.StringTemplate(document),
        multiline: string_1.StringTemplate(document, true)
    }), schema => Array.isArray(schema.enum) && schema.enum.length > 1)));
    return templates;
};
exports.ClientFormTemplates = (document, Event) => {
    const templates = exports.ServerFormTemplates(document);
    templates.arrayList = fieldset_1.FieldsetDecorator(document, mutable_array_list_1.MutableArrayListDecorator(document, Event, array_list_1.ArrayListTemplate(document, templates), templates));
    templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(document, array_item_1.ArrayItemTemplate(document, templates));
    return templates;
};
//# sourceMappingURL=index.js.map