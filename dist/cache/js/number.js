"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaNumber = void 0;
const itsa_1 = require("./itsa");
class ItsaNumber {
    number() {
        this.predicates.push({ id: 'number' });
        return this;
    }
}
exports.ItsaNumber = ItsaNumber;
itsa_1.Itsa.extend(ItsaNumber, {
    id: 'number',
    validate: (context) => {
        const { val, type, result } = context;
        if (type !== 'number')
            return result.addError(`Expected number but type is ${type}.`);
        if (isNaN(val))
            return result.addError(`Expected number but found NaN.`);
        if (!isFinite(val))
            return result.addError(`Expected number but found infinity.`);
    }
});
//# sourceMappingURL=number.js.map