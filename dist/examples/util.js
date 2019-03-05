"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntries = (window, element) => {
    const { document, FormData } = window;
    const form = document.createElement('form');
    form.appendChild(element);
    // workaround for jsdom bug https://github.com/jsdom/jsdom/issues/2523
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
//# sourceMappingURL=util.js.map