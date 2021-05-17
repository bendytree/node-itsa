"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaInteger = void 0;
const itsa_1 = require("./itsa");
class ItsaInteger {
    integer() {
        this.predicates.push({ id: 'integer', settings: null });
        return this;
    }
}
exports.ItsaInteger = ItsaInteger;
itsa_1.Itsa.extend(ItsaInteger, {
    id: 'integer',
    validate: (context) => {
        const { val, result } = context;
        const valid = typeof val === "number"
            && isNaN(val) === false
            && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
            && val % 1 === 0;
        if (!valid) {
            result.addError('Invalid integer');
        }
    }
});
//# sourceMappingURL=integer.js.map