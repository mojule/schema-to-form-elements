"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactFormJson = require("../schema/contact-form.schema.json");
const nestedArrayJson = require("../schema/nested-array.schema.json");
const __1 = require("../");
const index_js_1 = require("../templates/index.js");
const templates = index_js_1.ClientFormTemplates(document);
const schemaToFormElements = __1.SchemaToFormElements(templates);
const contactFormSchema = contactFormJson;
const contactForm = document.createElement('form');
contactForm.appendChild(schemaToFormElements(contactFormSchema, 'contact-form'));
document.body.appendChild(contactForm);
const nestArraySchema = nestedArrayJson;
const schemaToClientFormElements = __1.SchemaToFormElements(templates);
const mutableListForm = document.createElement('form');
mutableListForm.appendChild(schemaToClientFormElements(nestArraySchema, 'nested-array'));
document.body.appendChild(mutableListForm);
//# sourceMappingURL=client.js.map