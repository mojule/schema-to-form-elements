"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const utils_1 = require("../templates/utils");
const jsdom = new jsdom_1.JSDOM(`<!doctype html>`);
_a = jsdom.window, exports.document = _a.document, exports.FormData = _a.FormData, exports.Event = _a.Event;
exports.form = utils_1.Form(exports.document);
//# sourceMappingURL=dom.js.map