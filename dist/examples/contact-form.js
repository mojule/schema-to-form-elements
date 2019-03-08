"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactForm = require("../schema/contact-form.schema.json");
const object_1 = require("../templates/types/object");
const string_1 = require("../templates/types/string");
const label_1 = require("../templates/decorators/label");
const fieldset_1 = require("../templates/decorators/fieldset");
const format_1 = require("../templates/decorators/format");
const utils_1 = require("../templates/utils");
const dom_1 = require("../server/dom");
const schema = contactForm;
const stringTemplate = string_1.StringTemplate(dom_1.document);
const objectTemplate = object_1.ObjectTemplate(dom_1.document, { string: stringTemplate });
const unnamed = objectTemplate(schema);
const named = objectTemplate(schema, 'contact');
const multilineStringTemplate = string_1.StringTemplate(dom_1.document, true);
const formattedStringTemplate = format_1.FormatDecorator(dom_1.document, {
    string: stringTemplate,
    multiline: multilineStringTemplate
});
const labelledStringTemplate = label_1.LabelDecorator(dom_1.document, formattedStringTemplate);
const labelledObjectTemplate = object_1.ObjectTemplate(dom_1.document, { string: labelledStringTemplate });
const fieldsetObjectTemplate = fieldset_1.FieldsetDecorator(dom_1.document, labelledObjectTemplate);
const decorated = fieldsetObjectTemplate(schema);
const unnamedEntries = utils_1.getEntries(dom_1.form({}, unnamed));
const namedEntries = utils_1.getEntries(dom_1.form({}, unnamed));
exports.contactFormExample = {
    'Unnamed Contact Form': unnamed.outerHTML,
    'Named Contact Form': named.outerHTML,
    'Decorated Contact Form': decorated.outerHTML,
    'Unnamed Contact Form Data': JSON.stringify(unnamedEntries, null, 2),
    'Named Contact Form Data': JSON.stringify(namedEntries, null, 2),
    "Unnamed Contact Form Pointers": JSON.stringify(utils_1.entriesToPointers(unnamedEntries), null, 2),
    "Named Contact Form Pointers": JSON.stringify(utils_1.entriesToPointers(namedEntries), null, 2)
};
//# sourceMappingURL=contact-form.js.map