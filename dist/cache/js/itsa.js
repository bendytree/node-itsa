"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itsa = exports.Itsa = exports.ItsaValidationResultBuilder = exports.ItsaValidationException = void 0;
class ItsaValidationException extends Error {
    constructor(result) {
        super();
        this.message = `${result.errors[0].path.join('.')}: ${result.errors[0].message}`;
        this.result = result;
    }
}
exports.ItsaValidationException = ItsaValidationException;
class ItsaValidationResultBuilder {
    constructor(exhaustive, key, path) {
        this.exhaustive = exhaustive;
        this.key = key;
        this.path = path;
        this.ok = true;
        this.errors = [];
        this.value = undefined;
        this.message = undefined;
    }
    addError(message) {
        this.ok = false;
        this.message = message;
        this.errors.push({ message, key: this.key, path: this.path }); // path: null, val,
        if (!this.exhaustive) {
            throw 'STOP_ON_FIRST_ERROR';
        }
    }
    combine(result) {
        this.ok = this.ok && result.ok;
        for (const e of result.errors) {
            this.errors.push(e);
            if (!this.exhaustive) {
                throw 'STOP_ON_FIRST_ERROR';
            }
        }
    }
}
exports.ItsaValidationResultBuilder = ItsaValidationResultBuilder;
class Itsa {
    constructor() {
        this.predicates = [];
    }
    static extend(cls, ...validators) {
        for (const validator of validators) {
            Itsa.validators[validator.id] = validator;
        }
        const keys = Object.getOwnPropertyNames(cls.prototype).filter(m => m !== 'constructor');
        for (const key of keys) {
            const val = cls.prototype[key];
            Itsa.prototype[key] = val;
            /* istanbul ignore next */
            if (typeof val === 'function') {
                exports.itsa[key] = (...args) => {
                    const it = new Itsa();
                    return it[key](...args);
                };
            }
        }
    }
}
exports.Itsa = Itsa;
Itsa.validators = {};
exports.itsa = { predicates: [] };
require("./any");
require("./anything");
require("./array");
require("./between");
require("./boolean");
require("./constructor");
require("./convert");
require("./date");
require("./default");
require("./email");
require("./equal");
require("./falsy");
require("./function");
require("./instanceof");
require("./integer");
require("./length");
require("./matches");
require("./max");
require("./min");
require("./not-empty");
require("./null");
require("./number");
require("./object");
require("./objectid");
require("./serialize");
require("./string");
require("./to");
require("./truthy");
require("./typeof");
require("./unique");
require("./validate");
require("./verify");
//# sourceMappingURL=itsa.js.map