"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const contactForm = require("../schema/contact-form.schema.json");
const index_1 = require("../templates/index");
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
const { document } = jsdom.window;
const templates = index_1.SchemaTemplates(document);
const objectElement = templates.object(contactForm);
console.log(objectElement.outerHTML);
//# sourceMappingURL=server.js.map