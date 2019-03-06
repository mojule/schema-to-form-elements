"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactFormJson = require("../schema/contact-form.schema.json");
const nestedArrayJson = require("../schema/nested-array.schema.json");
const __1 = require("../");
const templates_1 = require("../templates");
const schemaToFormElements = __1.SchemaToFormElements(document);
const contactFormSchema = contactFormJson;
const contactForm = document.createElement('form');
contactForm.appendChild(schemaToFormElements(contactFormSchema, 'contact-form'));
document.body.appendChild(contactForm);
const nestArraySchema = nestedArrayJson;
const clientTemplates = templates_1.ClientFormTemplates(document);
const schemaToClientFormElements = __1.SchemaToFormElements(document, clientTemplates);
const mutableListForm = document.createElement('form');
mutableListForm.appendChild(schemaToClientFormElements(nestArraySchema, 'nested-array'));
document.body.appendChild(mutableListForm);
//# sourceMappingURL=client.js.map