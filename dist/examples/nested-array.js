"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const nestedArray = require("../schema/nested-array.schema.json");
const array_1 = require("../templates/types/array");
const number_1 = require("../templates/types/number");
const array_items_1 = require("../templates/array-items");
const util_1 = require("./util");
const schema = nestedArray;
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
const { document } = jsdom.window;
const templates = {};
templates.number = number_1.NumberTemplate(document);
templates.arrayItems = array_items_1.ArrayItemsTemplate(document, templates);
templates.array = array_1.ArrayTemplate(document, templates);
const unnamed = templates.array(schema);
const named = templates.array(schema, 'nested-array');
// api[ 'nested-array' ].add( [ 5, 6 ] )
// api[ 'nested-array' ].add( [ 7, 8 ] )
// api[ 'nested-array' ].remove( 3 )
const unnamedEntries = util_1.getEntries(jsdom.window, unnamed);
const namedEntries = util_1.getEntries(jsdom.window, named);
exports.nestedArrayExample = {
    'Unnamed Nested Array': unnamed.outerHTML,
    'Named Nested Array': named.outerHTML,
    'Unnamed Nested Array Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Nested Array Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Nested Array Pointers": JSON.stringify(util_1.entriesToPointers(unnamedEntries), null, 2),
    "Naamed Nested Array Pointers": JSON.stringify(util_1.entriesToPointers(namedEntries), null, 2),
};
//# sourceMappingURL=nested-array.js.map