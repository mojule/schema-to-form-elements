"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ensure_default_dependencies_1 = require("./ensure-default-dependencies");
const string_1 = require("./types/string");
const boolean_1 = require("./types/boolean");
const number_1 = require("./types/number");
const string_textarea_1 = require("./string-textarea");
const object_1 = require("./types/object");
const array_1 = require("./types/array");
const array_items_1 = require("./array-items");
const tuple_1 = require("./tuple");
const decorate_template_1 = require("../decorators/decorate-template");
const label_decorator_1 = require("../decorators/label-decorator");
const name_decorator_1 = require("../decorators/name-decorator");
exports.SchemaTemplates = (document, dependencies = {}) => {
    const deps = ensure_default_dependencies_1.ensureDefaultDependencies(document, dependencies);
    const labelDecorator = label_decorator_1.LabelDecorator(document);
    const nameDecorator = name_decorator_1.NameDecorator(document);
    deps.array = deps.array || array_1.ArrayTemplate(document, deps);
    deps.boolean = deps.boolean || boolean_1.BooleanTemplate(document, deps);
    deps.number = deps.number || number_1.NumberTemplate(document, deps);
    deps.object = deps.object || object_1.ObjectTemplate(document, deps);
    deps.string = deps.string || string_1.StringTemplate(document, deps);
    deps.arrayItems = deps.arrayItems || array_items_1.ArrayItemsTemplate(document, deps);
    deps.stringTextArea = deps.stringTextArea || string_textarea_1.StringTextAreaTemplate(document, deps);
    deps.tuple = deps.tuple || tuple_1.TupleTemplate(document, deps);
    Object.keys(deps).forEach(key => {
        deps[key] = decorate_template_1.decorateTemplate(deps[key], labelDecorator, nameDecorator);
    });
    return deps;
};
//# sourceMappingURL=index.js.map