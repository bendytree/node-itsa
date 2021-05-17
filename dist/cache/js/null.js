"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaNull = void 0;
const itsa_1 = require("./itsa");
class ItsaNull {
    null() {
        const settings = { example: null, strict: true };
        this.predicates.push({ id: 'equal', settings });
        return this;
    }
    undefined() {
        const settings = { example: undefined, strict: true };
        this.predicates.push({ id: 'equal', settings });
        return this;
    }
}
exports.ItsaNull = ItsaNull;
itsa_1.Itsa.extend(ItsaNull);
//# sourceMappingURL=null.js.map