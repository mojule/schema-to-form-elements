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
exports.GetEntries = (FormData) => (form) => {
    form.querySelectorAll('input').forEach(input => {
        input.value = input.value || '';
    });
    const formData = new FormData(form);
    return Array.from(formData.entries()).map(([key, value]) => [key, String(value)]);
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