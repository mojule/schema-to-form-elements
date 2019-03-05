"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const simpleArray = require("../schema/simple-array.schema.json");
const array_1 = require("../templates/types/array");
const number_1 = require("../templates/types/number");
const array_list_1 = require("../templates/array-list");
const array_list_2 = require("../templates/api/array-list");
const util_1 = require("./util");
const array_item_js_1 = require("../templates/array-item.js");
const schema = simpleArray;
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
const { document } = jsdom.window;
const templates = {};
templates.number = number_1.NumberTemplate(document);
templates.arrayItem = array_item_js_1.ArrayItemTemplate(document, templates);
templates.arrayList = array_list_1.ArrayListTemplate(document, templates);
templates.array = array_1.ArrayTemplate(document, templates);
const unnamed = templates.array(schema);
const named = templates.array(schema, 'simple-array');
const simpleArrayApi = array_list_2.ArrayListApi(named, schema, templates);
simpleArrayApi.add(4);
simpleArrayApi.add(5);
simpleArrayApi.remove(3);
const unnamedEntries = util_1.getEntries(jsdom.window, unnamed);
const namedEntries = util_1.getEntries(jsdom.window, named);
exports.simpleArrayExample = {
    'Unnamed Simple Array': unnamed.outerHTML,
    'Named Simple Array': named.outerHTML,
    'Unnamed Simple Array Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Simple Array Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Simple Array Pointers": JSON.stringify(util_1.entriesToPointers(unnamedEntries), null, 2),
    "Naamed Simple Array Pointers": JSON.stringify(util_1.entriesToPointers(namedEntries), null, 2),
};
//# sourceMappingURL=simple-array.js.map