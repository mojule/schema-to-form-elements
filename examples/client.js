(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../":2,"../schema/contact-form.schema.json":3,"../schema/nested-array.schema.json":4,"../templates/index.js":11}],2:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./templates/api/array-list"));
__export(require("./templates/decorators/fieldset"));
__export(require("./templates/decorators/format"));
__export(require("./templates/decorators/label"));
__export(require("./templates/decorators/mutable-array-list"));
__export(require("./templates/types/array"));
__export(require("./templates/types/boolean"));
__export(require("./templates/types/number"));
__export(require("./templates/types/object"));
__export(require("./templates/types/string"));
__export(require("./templates/types/array/array-item"));
__export(require("./templates/types/array/array-list"));
__export(require("./templates/types/array/tuple"));
__export(require("./templates/types"));
__export(require("./templates/utils"));
__export(require("./templates"));
exports.SchemaToFormElements = (templates) => {
    const schemaToFormElements = (schema, name = '', value) => {
        if (typeof schema.type !== 'string')
            throw Error('Expected type to be a string');
        if (!schemaTypeNames.includes(schema.type))
            throw Error(`Expected type to be one of ${schemaTypeNames}`);
        const template = templates[schema.type];
        if (!template)
            throw Error(`No template found for ${schema.type}`);
        return template(schema, name, value);
    };
    return schemaToFormElements;
};
const schemaTypeNames = [
    'array', 'boolean', 'number', 'integer', 'object', 'string'
];

},{"./templates":11,"./templates/api/array-list":5,"./templates/decorators/fieldset":6,"./templates/decorators/format":7,"./templates/decorators/label":8,"./templates/decorators/mutable-array-list":9,"./templates/types":17,"./templates/types/array":14,"./templates/types/array/array-item":12,"./templates/types/array/array-list":13,"./templates/types/array/tuple":15,"./templates/types/boolean":16,"./templates/types/number":18,"./templates/types/object":19,"./templates/types/string":20,"./templates/utils":21}],3:[function(require,module,exports){
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
const array_item_1 = require("../types/array/array-item");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.ArrayListApi = (document, container, schema, templates) => {
    const list = container.querySelector('ol');
    if (!list)
        throw Error('ArrayListApi: container is missing OL');
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
        let arrayItem = templates.arrayItem;
        if (!arrayItem) {
            arrayItem = array_item_1.ArrayItemTemplate(document, templates);
        }
        const key = count();
        const childName = utils_1.getChildName(name, count());
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
            const oldName = utils_1.getChildName(name, i);
            const newName = utils_1.getChildName(name, i - 1);
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

},{"../types/array/array-item":12,"../utils":21}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.FieldsetDecorator = (document, containerTemplate, useLegend = true) => {
    const fieldsetDecorator = (schema = {}, name = '', value) => {
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

},{"../utils":21}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDecorator = (_document, stringTemplates, formatToTemplateKey = new Map(), formatToTypeAttribute = exports.defaultFormatToType) => {
    const formatDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const stringTemplate = stringTemplates.string;
        let format;
        if (typeof schema.format !== 'string') {
            return stringTemplate(schema, name, value, isRequired);
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

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.LabelDecorator = (document, inputTemplate, isSuffix = false) => {
    const labelDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const editor = inputTemplate(schema, name, value, isRequired);
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML =
            `${utils_1.getTitle(schema, name, 'Input')}${isRequired ? '*' : ''}`;
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

},{"../utils":21}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_list_1 = require("../api/array-list");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.MutableArrayListDecorator = (document, arrayList, templates) => {
    const mutableArrayListDecorator = (schema = {}, name = '', value) => {
        const container = arrayList(schema, name, value);
        if (!schema.items ||
            Array.isArray(schema.items) ||
            typeof schema.items.type !== 'string')
            return container;
        const api = array_list_1.ArrayListApi(document, container, schema, templates);
        const title = `Add ${utils_1.getTitle(schema.items, '', 'Item')}`;
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.innerHTML = title;
        addButton.dataset.action = 'array-list-add';
        container.appendChild(addButton);
        container.addEventListener('click', e => {
            const target = e.target;
            if (target.dataset.action === 'array-list-add') {
                e.stopPropagation();
                api.add();
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (target.dataset.action === 'array-list-delete') {
                e.stopPropagation();
                const li = target.closest('li');
                // can't throw errors in event handlers, no way to catch them
                // when using dispatchEvent, so throwing makes this untestable
                if (!li)
                    return;
                const ol = li.parentNode;
                const index = Array.from(ol.children).indexOf(li);
                api.remove(index);
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        return container;
    };
    return mutableArrayListDecorator;
};
exports.MutableArrayItemDecorator = (document, arrayItem) => {
    const mutableArrayItemDecorator = (schema = {}, name = '', value) => {
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

},{"../api/array-list":5,"../utils":21}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.SelectDecorator = (document, stringTemplate) => {
    const selectDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (!Array.isArray(schema.enum))
            return stringTemplate(schema, name, value, isRequired);
        if (!schema.enum.every(value => typeof value === 'string'))
            throw Error('Expected enum to be an array of strings');
        const enumValues = schema.enum;
        const editor = document.createElement('select');
        editor.title = utils_1.getTitle(schema, name, 'String');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        enumValues.forEach((enumValue, i) => {
            const option = document.createElement('option');
            const title = (schema['_enumTitles'] && schema['_enumTitles'][i] ?
                schema['_enumTitles'][i] :
                enumValue);
            option.value = enumValue;
            option.innerHTML = title;
            if (typeof value === 'string') {
                option.selected = enumValue === value;
            }
            else if (typeof schema.default === 'string') {
                option.selected = enumValue === schema.default;
            }
            editor.appendChild(option);
        });
        return editor;
    };
    return selectDecorator;
};

},{"../utils":21}],11:[function(require,module,exports){
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
const array_list_1 = require("./types/array/array-list");
const array_item_1 = require("./types/array/array-item");
const select_1 = require("./decorators/select");
exports.ServerFormTemplates = (document) => {
    const templates = {};
    templates.array = fieldset_1.FieldsetDecorator(document, array_1.ArrayTemplate(document, templates));
    templates.boolean = label_1.LabelDecorator(document, boolean_1.BooleanTemplate(document), true);
    templates.number = label_1.LabelDecorator(document, number_1.NumberTemplate(document));
    templates.integer = templates.number;
    templates.object = fieldset_1.FieldsetDecorator(document, object_1.ObjectTemplate(document, templates));
    templates.string = label_1.LabelDecorator(document, select_1.SelectDecorator(document, format_1.FormatDecorator(document, {
        string: string_1.StringTemplate(document),
        multiline: string_1.StringTemplate(document, true)
    })));
    return templates;
};
exports.ClientFormTemplates = (document) => {
    const templates = exports.ServerFormTemplates(document);
    templates.arrayList = fieldset_1.FieldsetDecorator(document, mutable_array_list_1.MutableArrayListDecorator(document, array_list_1.ArrayListTemplate(document, templates), templates));
    templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(document, array_item_1.ArrayItemTemplate(document, templates));
    return templates;
};

},{"./decorators/fieldset":6,"./decorators/format":7,"./decorators/label":8,"./decorators/mutable-array-list":9,"./decorators/select":10,"./types/array":14,"./types/array/array-item":12,"./types/array/array-list":13,"./types/boolean":16,"./types/number":18,"./types/object":19,"./types/string":20}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemTemplate = (document, templates = {}) => {
    const arrayItemEditor = (schema = {}, name = '', value) => {
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

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("./array-item");
const utils_1 = require("../../utils");
exports.ArrayListTemplate = (document, templates = {}) => {
    const arrayListEditor = (schema = {}, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Array List');
        if (name)
            container.dataset.name = name;
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        const template = templates[childSchema.type];
        if (!template)
            return container;
        const itemTemplate = (templates.arrayItem || array_item_1.ArrayItemTemplate(document, templates));
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
        const hasMaxItems = typeof schema.maxItems === 'number';
        const hasMinItems = typeof schema.minItems === 'number';
        let count = (Array.isArray(value) ? value.length :
            hasMaxItems ? schema.maxItems :
                hasMinItems ? schema.minItems :
                    1);
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
            const childName = utils_1.getChildName(name, key);
            const li = itemTemplate(childSchema, childName, childValue);
            list.appendChild(li);
        }
        return container;
    };
    return arrayListEditor;
};

},{"../../utils":21,"./array-item":12}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("./tuple");
const array_list_1 = require("./array-list");
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema = {}, name = '', value) => {
        if (typeof value === 'undefined' &&
            Array.isArray(schema.default)) {
            value = schema.default;
        }
        if (Array.isArray(schema.items)) {
            if (templates.tuple) {
                return templates.tuple(schema, name, value);
            }
            return tuple_1.TupleTemplate(document, templates)(schema, name, value);
        }
        if (templates.arrayList) {
            return templates.arrayList(schema, name, value);
        }
        return array_list_1.ArrayListTemplate(document, templates)(schema, name, value);
    };
    return arrayTemplate;
};

},{"./array-list":13,"./tuple":15}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Tuple');
        if (name)
            container.dataset.name = name;
        if (!Array.isArray(schema.items))
            return container;
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
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
            const childName = utils_1.getChildName(name, key);
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};

},{"../../utils":21}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.BooleanTemplate = (document) => {
    const booleanTemplate = (schema = {}, name = '', value) => {
        const editor = document.createElement('input');
        editor.type = 'checkbox';
        editor.title = utils_1.getTitle(schema, name, 'Boolean');
        if (Array.isArray(schema.enum) &&
            schema.enum.length === 1 &&
            schema.enum[0] === true)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'boolean') {
            if (value)
                editor.setAttribute('checked', '');
        }
        else if (typeof schema.default === 'boolean') {
            if (schema.default)
                editor.setAttribute('checked', '');
        }
        return editor;
    };
    return booleanTemplate;
};

},{"../utils":21}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./array");
const boolean_1 = require("./boolean");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
exports.TypeTemplates = (document) => {
    const templates = {};
    templates.array = array_1.ArrayTemplate(document, templates);
    templates.boolean = boolean_1.BooleanTemplate(document);
    templates.number = number_1.NumberTemplate(document);
    templates.integer = templates.number;
    templates.object = object_1.ObjectTemplate(document, templates);
    templates.string = string_1.StringTemplate(document);
    return templates;
};

},{"./array":14,"./boolean":16,"./number":18,"./object":19,"./string":20}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.NumberTemplate = (document, isRange = false) => {
    const numberTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const editor = document.createElement('input');
        editor.type = isRange ? 'range' : 'number';
        editor.title = utils_1.getTitle(schema, name, schema.type === 'integer' ? 'Integer' : 'Number');
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
        if (typeof schema.minimum === 'number') {
            editor.min = String(schema.minimum);
        }
        if (typeof schema.maximum === 'number') {
            editor.max = String(schema.maximum);
        }
        return editor;
    };
    return numberTemplate;
};

},{"../utils":21}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.ObjectTemplate = (document, templates = {}) => {
    const objectTemplate = (schema = {}, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Object');
        if (name)
            container.dataset.name = name;
        if (!schema.properties)
            return container;
        if (typeof value === 'undefined' && typeof schema.default !== 'undefined')
            value = schema.default;
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
            const childName = utils_1.getChildName(name, key);
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return objectTemplate;
};

},{"../utils":21}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.StringTemplate = (document, isMultiline = false) => {
    const stringTemplate = (schema = {}, name = '', value, isRequired = false) => {
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
        if (typeof schema.minLength === 'number') {
            editor.minLength = schema.minLength;
        }
        if (typeof schema.maxLength === 'number') {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTemplate;
};

},{"../utils":21}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = (schema, name = '', fallback = 'Schema') => schema.title || name || fallback;
exports.getChildName = (name, key) => name ? `${name}[${key}]` : String(key);
exports.H = (document, name) => (attributes = {}, ...children) => {
    const el = document.createElement(name);
    Object.keys(attributes).forEach(name => el.setAttribute(name, String(attributes[name])));
    children.forEach(child => el.appendChild(child));
    return el;
};
exports.Form = (document) => exports.H(document, 'form');
exports.getEntries = (form, allowEmptyValue = true) => {
    const result = [];
    // todo: won't work with select etc!
    const inputs = Array.from(form.querySelectorAll('input, textarea'));
    inputs.forEach(input => {
        let { name, value } = input;
        if (!value && !allowEmptyValue) {
            return;
        }
        let typedValue = value;
        if (name.endsWith('__number') ||
            name.endsWith('__string') ||
            name.endsWith('__boolean')) {
            name = name.split('__')[0];
        }
        if (input.type === 'number')
            typedValue = Number(typedValue);
        if (input.type === 'checkbox')
            typedValue = input.checked;
        result.push([name, typedValue]);
    });
    return result;
};
exports.keyToJsonPointer = (key) => {
    key = key.replace(/\[/g, '/');
    key = key.replace(/\]/g, '/');
    if (key[key.length - 1] === '/')
        key = key.substr(0, key.length - 1);
    if (!key.startsWith('/'))
        key = '/' + key;
    return key;
};
exports.entriesToPointers = (entries) => entries.map(([key, value]) => [exports.keyToJsonPointer(key), value]);

},{}]},{},[1]);
