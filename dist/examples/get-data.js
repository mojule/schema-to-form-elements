"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../templates/utils");
const json_pointer_1 = require("@mojule/json-pointer");
exports.getData = (form) => {
    const entries = utils_1.getEntries(form, false);
    const pointers = utils_1.entriesToPointers(entries);
    const map = {};
    pointers.forEach(([pointer, value]) => {
        map[pointer] = value;
    });
    return json_pointer_1.expand(map);
};
//# sourceMappingURL=get-data.js.map