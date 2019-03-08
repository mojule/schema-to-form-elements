"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simpleArray = require("../schema/simple-array.schema.json");
const array_1 = require("../templates/types/array");
const number_1 = require("../templates/types/number");
const array_list_1 = require("../templates/types/array/array-list");
const array_list_2 = require("../templates/api/array-list");
const array_item_1 = require("../templates/types/array/array-item");
const dom_1 = require("../server/dom");
const utils_1 = require("../templates/utils");
const schema = simpleArray;
const templates = {};
templates.number = number_1.NumberTemplate(dom_1.document);
templates.arrayItem = array_item_1.ArrayItemTemplate(dom_1.document, templates);
templates.arrayList = array_list_1.ArrayListTemplate(dom_1.document, templates);
templates.array = array_1.ArrayTemplate(dom_1.document, templates);
const unnamed = templates.array(schema);
const named = templates.array(schema, 'simple-array');
const simpleArrayApi = array_list_2.ArrayListApi(dom_1.document, named, schema, templates);
simpleArrayApi.add(4);
simpleArrayApi.add(5);
simpleArrayApi.remove(3);
const unnamedEntries = utils_1.getEntries(dom_1.form({}, unnamed));
const namedEntries = utils_1.getEntries(dom_1.form({}, named));
exports.simpleArrayExample = {
    'Unnamed Simple Array': unnamed.outerHTML,
    'Named Simple Array': named.outerHTML,
    'Unnamed Simple Array Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Simple Array Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Simple Array Pointers": JSON.stringify(utils_1.entriesToPointers(unnamedEntries), null, 2),
    "Named Simple Array Pointers": JSON.stringify(utils_1.entriesToPointers(namedEntries), null, 2)
};
//# sourceMappingURL=simple-array.js.map