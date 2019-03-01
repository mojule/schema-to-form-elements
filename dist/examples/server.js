"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contact_form_1 = require("./contact-form");
const simple_array_1 = require("./simple-array");
const nested_array_1 = require("./nested-array");
console.log('Contact Form:\n\n');
Object.keys(contact_form_1.contactFormExample).forEach(key => {
    console.log(key);
    console.log(contact_form_1.contactFormExample[key]);
    console.log();
});
console.log('Simple Array:\n\n');
Object.keys(simple_array_1.simpleArrayExample).forEach(key => {
    console.log(key);
    console.log(simple_array_1.simpleArrayExample[key]);
    console.log();
});
console.log('Nested Array:\n\n');
Object.keys(nested_array_1.nestedArrayExample).forEach(key => {
    console.log(key);
    console.log(nested_array_1.nestedArrayExample[key]);
    console.log();
});
//# sourceMappingURL=server.js.map