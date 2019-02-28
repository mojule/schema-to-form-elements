"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_1 = require("./container");
const input_1 = require("./input");
exports.OptionsFactory = (document, options) => {
    const input = input_1.InputTemplate(document);
    const container = container_1.ContainerTemplate(document);
    const defaults = { input, container };
    return Object.assign(options, defaults, options);
};
//# sourceMappingURL=default-options.js.map