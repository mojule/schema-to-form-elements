"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_1 = require("./container");
const input_1 = require("./input");
exports.ensureDefaultDependencies = (document, dependencies) => {
    const input = dependencies && dependencies.input || input_1.InputTemplate(document);
    const container = dependencies && dependencies.container || container_1.ContainerTemplate(document);
    return Object.assign(dependencies, { input, container });
};
//# sourceMappingURL=ensure-default-dependencies.js.map