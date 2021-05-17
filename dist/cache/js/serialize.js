"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaSerialize = void 0;
const itsa_1 = require("./itsa");
const convert = (el) => {
    const proto = Object.prototype.toString.call(el);
    const isObject = `[object Object]` === proto;
    const isArray = `[object Array]` === proto;
    if (!isObject && !isArray) {
        return el;
    }
    // replace sub-schemas: depth first
    for (const key in el) {
        el[key] = convert(el[key]);
    }
    if (isObject && el.predicates) {
        const i = new itsa_1.Itsa();
        i.predicates = el.predicates;
        return i;
    }
    return el;
};
class ItsaSerialize {
    load(raw) {
        this.predicates = convert(raw).predicates;
        return this;
    }
}
exports.ItsaSerialize = ItsaSerialize;
itsa_1.Itsa.extend(ItsaSerialize);
//# sourceMappingURL=serialize.js.map