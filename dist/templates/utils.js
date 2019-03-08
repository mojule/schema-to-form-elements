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
//# sourceMappingURL=utils.js.map