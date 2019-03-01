"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const contactForm = require("../schema/contact-form.schema.json");
const object_1 = require("../templates/types/object");
const string_1 = require("../templates/types/string");
const label_1 = require("../templates/decorators/label");
const fieldset_1 = require("../templates/decorators/fieldset");
const format_1 = require("../templates/decorators/format");
const util_js_1 = require("./util.js");
const schema = contactForm;
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
const { document, FormData } = jsdom.window;
const stringTemplate = string_1.StringTemplate(document);
const objectTemplate = object_1.ObjectTemplate(document, { string: stringTemplate });
const unnamed = objectTemplate(schema);
const named = objectTemplate(schema, 'contact');
const multilineStringTemplate = string_1.StringTemplate(document, true);
const formattedStringTemplate = format_1.FormatDecorator(document, stringTemplate, multilineStringTemplate);
const labelledStringTemplate = label_1.LabelDecorator(document, formattedStringTemplate);
const labelledObjectTemplate = object_1.ObjectTemplate(document, { string: labelledStringTemplate });
const fieldsetObjectTemplate = fieldset_1.FieldsetDecorator(document, labelledObjectTemplate);
const decorated = fieldsetObjectTemplate(schema);
const unnamedEntries = util_js_1.getEntries(jsdom.window, unnamed);
const namedEntries = util_js_1.getEntries(jsdom.window, named);
exports.contactFormExample = {
    'Unnamed Contact Form': unnamed.outerHTML,
    'Named Contact Form': named.outerHTML,
    'Decorated Contact Form': decorated.outerHTML,
    'Unnamed Contact Form Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Contact Form Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Contact Form Pointers": JSON.stringify(util_js_1.entriesToPointers(unnamedEntries), null, 2),
    "Naamed Contact Form Pointers": JSON.stringify(util_js_1.entriesToPointers(namedEntries), null, 2)
};
//# sourceMappingURL=contact-form.js.map