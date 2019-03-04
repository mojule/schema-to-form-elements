"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const simpleArray = require("../schema/simple-array.schema.json");
const array_1 = require("../templates/types/array");
const number_1 = require("../templates/types/number");
const array_items_1 = require("../templates/array-items");
const array_items_2 = require("../templates/api/array-items");
const util_1 = require("./util");
const schema = simpleArray;
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
const { document } = jsdom.window;
const numberTemplate = number_1.NumberTemplate(document);
const arrayItemsTemplate = array_items_1.ArrayItemsTemplate(document, { number: numberTemplate });
const { arrayItemsDecorator, arrayItemsApi } = array_items_2.ArrayItemsApi(document, { number: numberTemplate, arrayItems: arrayItemsTemplate });
const arrayTemplate = array_1.ArrayTemplate(document, { number: numberTemplate, arrayItems: arrayItemsDecorator });
const unnamed = arrayTemplate(schema);
const named = arrayTemplate(schema, 'simple-array');
arrayItemsApi['simple-array'].add(4);
arrayItemsApi['simple-array'].add(5);
arrayItemsApi['simple-array'].remove(3);
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