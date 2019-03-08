"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestedArray = require("../schema/nested-array.schema.json");
const array_1 = require("../templates/types/array");
const number_1 = require("../templates/types/number");
const array_list_1 = require("../templates/types/array/array-list");
const array_list_2 = require("../templates/api/array-list");
const array_item_1 = require("../templates/types/array/array-item");
const utils_1 = require("../templates/utils");
const dom_1 = require("../server/dom");
const schema = nestedArray;
const templates = {};
templates.number = number_1.NumberTemplate(dom_1.document);
templates.arrayItem = array_item_1.ArrayItemTemplate(dom_1.document, templates);
templates.arrayList = array_list_1.ArrayListTemplate(dom_1.document, templates);
templates.array = array_1.ArrayTemplate(dom_1.document, templates);
const unnamed = templates.array(schema);
const named = templates.array(schema, 'nested-array');
const namedApi = array_list_2.ArrayListApi(dom_1.document, named, schema, templates);
namedApi.add([5, 6]);
namedApi.add([7, 8]);
namedApi.remove(3);
const unnamedEntries = utils_1.getEntries(dom_1.form({}, unnamed));
const namedEntries = utils_1.getEntries(dom_1.form({}, named));
exports.nestedArrayExample = {
    'Unnamed Nested Array': unnamed.outerHTML,
    'Named Nested Array': named.outerHTML,
    'Unnamed Nested Array Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Nested Array Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Nested Array Pointers": JSON.stringify(utils_1.entriesToPointers(unnamedEntries), null, 2),
    "Named Nested Array Pointers": JSON.stringify(utils_1.entriesToPointers(namedEntries), null, 2),
};
//# sourceMappingURL=nested-array.js.map