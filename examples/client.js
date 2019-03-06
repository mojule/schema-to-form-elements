(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../":2,"../schema/contact-form.schema.json":3,"../schema/nested-array.schema.json":4,"../templates":12}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
exports.SchemaToFormElements = (document, templates = {}) => {
    templates = Object.assign({}, templates_1.FormTemplates(document), templates);
    const schemaToFormElements = (schema, name = '', value) => {
        if (typeof schema.type !== 'string')
            throw Error('Expected schema.type to be a string');
        const template = templates[schema.type];
        if (!template)
            throw Error(`No template found for ${schema.type}`);
        return template(schema, name, value);
    };
    return schemaToFormElements;
};

},{"./templates":12}],3:[function(require,module,exports){
module.exports={
    "type": "object",
    "title": "Contact Form",
    "description": "A simple Contact Form",
    "properties": {
        "name": {
            "type": "string",
            "title": "Name"
        },
        "email": {
            "type": "string",
            "title": "Email",
            "format": "email"
        },
        "subject": {
            "type": "string",
            "title": "Subject",
            "default": "I have a query"
        },
        "message": {
            "type": "string",
            "title": "Message",
            "format": "multiline"
        }
    },
    "required": [
        "name",
        "email",
        "message"
    ]
}

},{}],4:[function(require,module,exports){
module.exports={
    "type": "array",
    "title": "Nested Array",
    "description": "A nested array",
    "items": {
        "type": "array",
        "title": "Values",
        "items": {
            "title": "Value",
            "type": "number"
        }
    },
    "default": [[1, 2], [3, 4]]
}

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayListApi = (container, schema, templates = {}) => {
    const list = container.querySelector('ol');
    if (!list)
        throw Error('ArrayListApi: arrayList did not create an ol child');
    if (!schema.items || Array.isArray(schema.items))
        throw Error('ArrayListApi: schema.items should be a schema');
    const childSchema = schema.items;
    if (typeof childSchema.type !== 'string')
        throw Error('ArrayListApi: schema.items.type should be a string');
    const template = templates[childSchema.type];
    if (!template)
        throw Error(`ArrayListApi: missing template ${childSchema.type}`);
    const name = container.dataset.name || '';
    const count = () => list.childElementCount;
    const clear = () => { list.innerHTML = ''; };
    const add = (value) => {
        const arrayItem = templates.arrayItem;
        if (!arrayItem)
            throw Error(`ArrayListApi: missing template arrayItem`);
        const key = count();
        const childName = name ? `${name}[${key}]` : `[${key}]`;
        const li = arrayItem(childSchema, childName, value);
        list.appendChild(li);
        return key;
    };
    const remove = (index) => {
        if (index >= count())
            throw Error('ArrayListApi: remove index out of bounds');
        const previousCount = count();
        list.children[index].remove();
        renumber(previousCount, index + 1);
    };
    const renumber = (previousCount, from) => {
        const name = container.dataset.name || '';
        for (let i = from; i < previousCount; i++) {
            const oldName = `${name}[${i}]`;
            const newName = `${name}[${i - 1}]`;
            const targets = Array.from(list.querySelectorAll('[name]'));
            targets.forEach(target => {
                if (target.name.startsWith(oldName)) {
                    target.name = target.name.replace(oldName, newName);
                }
            });
        }
    };
    return {
        get count() {
            return count();
        },
        clear,
        add,
        remove
    };
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemTemplate = (document, templates = {}) => {
    const arrayItemEditor = (schema, name = '', value) => {
        const li = document.createElement('li');
        if (typeof schema.type !== 'string')
            return li;
        const template = templates[schema.type];
        if (!template)
            return li;
        const editorItem = template(schema, name, value);
        li.appendChild(editorItem);
        return li;
    };
    return arrayItemEditor;
};

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("./array-item");
const utils_1 = require("./utils");
exports.ArrayListTemplate = (document, templates = {}) => {
    const arrayListEditor = (schema, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Array Items');
        if (name)
            container.dataset.name = name;
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        const template = templates[childSchema.type];
        if (!template || !templates.arrayItem)
            return container;
        const itemTemplate = (templates.arrayItem || array_item_1.ArrayItemTemplate(document, templates));
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
        const hasMaxItems = typeof schema.maxItems === 'number';
        const hasMinItems = typeof schema.minItems === 'number';
        let count = (Array.isArray(value) ? value.length :
            hasMaxItems ? schema.maxItems :
                hasMinItems ? schema.minItems :
                    0);
        if (hasMaxItems && count > schema.maxItems) {
            count = schema.maxItems;
        }
        if (hasMinItems && count < schema.minItems) {
            count = schema.minItems;
        }
        const list = document.createElement('ol');
        container.appendChild(list);
        for (let key = 0; key < count; key++) {
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const li = itemTemplate(childSchema, childName, childValue);
            list.appendChild(li);
        }
        return container;
    };
    return arrayListEditor;
};

},{"./array-item":6,"./utils":19}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.FieldsetDecorator = (document, containerTemplate, useLegend = true) => {
    const fieldsetDecorator = (schema, name = '', value) => {
        const container = containerTemplate(schema, name, value);
        const title = utils_1.getTitle(schema, name, 'Container');
        const fieldset = document.createElement('fieldset');
        if (useLegend) {
            const legend = document.createElement('legend');
            legend.innerHTML = title;
            fieldset.appendChild(legend);
        }
        fieldset.appendChild(container);
        return fieldset;
    };
    return fieldsetDecorator;
};

},{"../utils":19}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDecorator = (_document, stringTemplates, formatToTemplateKey = new Map(), formatToTypeAttribute = exports.defaultFormatToType) => {
    const formatDecorator = (schema, name = '', value, isRequired = false) => {
        const stringTemplate = stringTemplates.string;
        let format;
        if (typeof schema.format !== 'string') {
            return stringTemplate(schema, name, value);
        }
        format = formatToTemplateKey.get(schema.format) || schema.format;
        if (typeof stringTemplates[format] !== 'undefined') {
            return stringTemplates[format](schema, name, value, isRequired);
        }
        const editor = stringTemplate(schema, name, value, isRequired);
        const input = (editor.matches('input') ? editor :
            editor.querySelector('input'));
        if (!input)
            throw Error('formatDecorator could not find an input element!');
        format = formatToTypeAttribute.get(schema.format) || schema.format;
        input.type = format;
        return editor;
    };
    return formatDecorator;
};
exports.defaultFormatToType = new Map();
exports.defaultFormatToType.set('date-time', 'datetime-local');
exports.defaultFormatToType.set('uri', 'url');

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.LabelDecorator = (document, inputTemplate, isSuffix = false) => {
    const labelDecorator = (schema, name = '', value, isRequired = false) => {
        const editor = inputTemplate(schema, name, value, isRequired);
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML = utils_1.getTitle(schema, name, 'Input');
        if (isSuffix) {
            label.appendChild(editor);
            label.appendChild(span);
        }
        else {
            label.appendChild(span);
            label.appendChild(editor);
        }
        return label;
    };
    return labelDecorator;
};

},{"../utils":19}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_list_1 = require("../api/array-list");
const utils_1 = require("../utils");
exports.MutableArrayListDecorator = (document, arrayList, templates = {}) => {
    const mutableArrayListDecorator = (schema, name = '', value) => {
        const container = arrayList(schema, name, value);
        if (!schema.items || Array.isArray(schema.items))
            throw Error('MutableArrayList: expected schema.items to be JSON Schema');
        const api = array_list_1.ArrayListApi(container, schema, templates);
        const title = `Add ${utils_1.getTitle(schema.items, '', 'Item')}`;
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.innerHTML = title;
        addButton.dataset.action = 'array-list-add';
        container.appendChild(addButton);
        container.addEventListener('click', e => {
            if (!(e.target instanceof HTMLButtonElement))
                return;
            if (e.target.dataset.action === 'array-list-add') {
                e.stopPropagation();
                api.add();
            }
            if (e.target.dataset.action === 'array-list-delete') {
                e.stopPropagation();
                const li = e.target.closest('li');
                if (!li)
                    throw Error('MutableArrayList: expected delete action to have an LI parent');
                const index = Array.from(li.parentNode.children).indexOf(li);
                console.log(`remove ${index}`);
                api.remove(index);
            }
        });
        return container;
    };
    return mutableArrayListDecorator;
};
exports.MutableArrayItemDecorator = (document, arrayItem) => {
    const mutableArrayItemDecorator = (schema, name = '', value) => {
        const item = arrayItem(schema, name, value);
        const title = `Delete ${utils_1.getTitle(schema, name, 'Item')}`;
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerHTML = title;
        deleteButton.dataset.action = 'array-list-delete';
        item.appendChild(deleteButton);
        return item;
    };
    return mutableArrayItemDecorator;
};

},{"../api/array-list":5,"../utils":19}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./types/array");
const boolean_1 = require("./types/boolean");
const number_1 = require("./types/number");
const object_1 = require("./types/object");
const string_1 = require("./types/string");
const fieldset_1 = require("./decorators/fieldset");
const format_1 = require("./decorators/format");
const label_1 = require("./decorators/label");
const mutable_array_list_1 = require("./decorators/mutable-array-list");
const array_list_1 = require("./array-list");
const array_item_1 = require("./array-item");
exports.FormTemplates = (document) => {
    const templates = {};
    templates.array = fieldset_1.FieldsetDecorator(document, array_1.ArrayTemplate(document, templates));
    templates.boolean = label_1.LabelDecorator(document, boolean_1.BooleanTemplate(document), true);
    templates.number = label_1.LabelDecorator(document, number_1.NumberTemplate(document));
    templates.object = fieldset_1.FieldsetDecorator(document, object_1.ObjectTemplate(document, templates));
    templates.string = label_1.LabelDecorator(document, format_1.FormatDecorator(document, {
        string: string_1.StringTemplate(document),
        multiline: string_1.StringTemplate(document, true)
    }));
    return templates;
};
exports.ClientFormTemplates = (document) => {
    const templates = exports.FormTemplates(document);
    templates.arrayList = mutable_array_list_1.MutableArrayListDecorator(document, array_list_1.ArrayListTemplate(document, templates), templates);
    templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(document, array_item_1.ArrayItemTemplate(document, templates));
    return templates;
};

},{"./array-item":6,"./array-list":7,"./decorators/fieldset":8,"./decorators/format":9,"./decorators/label":10,"./decorators/mutable-array-list":11,"./types/array":14,"./types/boolean":15,"./types/number":16,"./types/object":17,"./types/string":18}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Tuple');
        if (!Array.isArray(schema.items))
            return container;
        schema.items.forEach((childSchema, key) => {
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = name ? `${name}[${key}]` : `[${key}]`;
            const editor = template(childSchema, childName, childValue);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};

},{"./utils":19}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("../tuple");
const array_list_1 = require("../array-list");
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema, name = '', value) => {
        if (typeof value === 'undefined' &&
            Array.isArray(schema.default)) {
            value = schema.default;
        }
        const template = (Array.isArray(schema.items) ?
            templates.tuple || tuple_1.TupleTemplate(document, templates) :
            templates.arrayList || array_list_1.ArrayListTemplate(document, templates));
        return template(schema, name, value);
    };
    return arrayTemplate;
};

},{"../array-list":7,"../tuple":13}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.BooleanTemplate = (document) => {
    const booleanTemplate = (schema, name = '', value, isRequired = false) => {
        const editor = document.createElement('input');
        editor.type = 'checkbox';
        editor.title = utils_1.getTitle(schema, name, 'Boolean');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'boolean') {
            editor.checked = value;
        }
        else if (typeof schema.default === 'boolean') {
            editor.checked = schema.default;
        }
        return editor;
    };
    return booleanTemplate;
};

},{"../utils":19}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.NumberTemplate = (document, isRange = false) => {
    const numberTemplate = (schema, name = '', value, isRequired = false) => {
        const editor = document.createElement('input');
        editor.type = isRange ? 'range' : 'number';
        editor.title = utils_1.getTitle(schema, name, 'Number');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'number') {
            editor.defaultValue = String(value);
        }
        else if (typeof schema.default === 'number') {
            editor.defaultValue = String(schema.default);
        }
        if (typeof schema.multipleOf === 'number') {
            editor.step = String(schema.multipleOf);
        }
        else if (schema.type === 'integer') {
            editor.step = '1';
        }
        if ('minimum' in schema) {
            editor.min = String(schema.minimum);
        }
        if ('maximum' in schema) {
            editor.max = String(schema.maximum);
        }
        return editor;
    };
    return numberTemplate;
};

},{"../utils":19}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.ObjectTemplate = (document, templates = {}) => {
    const objectTemplate = (schema, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Object');
        if (name)
            container.dataset.name = name;
        if (!schema.properties)
            return container;
        value = value || schema.default;
        const required = schema.required || [];
        Object.keys(schema.properties).forEach(key => {
            const childSchema = schema.properties[key];
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childValue = undefined;
            if (typeof value === 'object') {
                childValue = value[key];
            }
            const isRequired = required.includes(key);
            const childName = name ? `${name}[${key}]` : key;
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return objectTemplate;
};

},{"../utils":19}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.StringTemplate = (document, isMultiline = false) => {
    const stringTemplate = (schema, name = '', value, isRequired = false) => {
        let editor;
        if (isMultiline) {
            editor = document.createElement('textarea');
        }
        else {
            editor = document.createElement('input');
            editor.type = 'text';
            if (schema.pattern) {
                editor.pattern = schema.pattern;
            }
        }
        editor.title = utils_1.getTitle(schema, name, 'String');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'string') {
            editor.defaultValue = value;
        }
        else if (typeof schema.default === 'string') {
            editor.defaultValue = schema.default;
        }
        if (schema.minLength !== undefined) {
            editor.minLength = schema.minLength;
        }
        if (schema.maxLength !== undefined) {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTemplate;
};

},{"../utils":19}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = (schema, name = '', fallback = 'Schema') => schema.title || name || fallback;

},{}]},{},[1]);
