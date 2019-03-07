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
//# sourceMappingURL=fieldset.js.map