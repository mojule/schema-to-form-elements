"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decorate_all_1 = require("./decorate-all");
exports.decorateTemplate = (template, ...decorators) => (schema) => decorate_all_1.decorateAll(template(schema), ...decorators);
//# sourceMappingURL=decorate-template.js.map