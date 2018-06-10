"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = (silent) => (content) => {
    if (!silent) {
        console.log(content);
    }
};
let consoleLogger;
exports.getLogger = (silent = false, debug = false) => {
    if (!consoleLogger) {
        consoleLogger = {
            log: exports.logger(silent),
            debug: exports.logger(!debug)
        };
    }
    return consoleLogger;
};
