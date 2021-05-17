"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaEqual = void 0;
const itsa_1 = require("./itsa");
class ItsaEqual {
    equal(val, settings = {}) {
        settings.example = val;
        this.predicates.push({ id: 'equal', settings });
        return this;
    }
}
exports.ItsaEqual = ItsaEqual;
itsa_1.Itsa.extend(ItsaEqual, {
    id: 'equal',
    validate: (context, settings) => {
        const { val, result } = context;
        const { example } = settings;
        const strict = settings.strict ?? true;
        const isEqual = strict ? (val === example) : (val == example);
        if (!isEqual) {
            result.addError(`Did not equal ${example}`);
        }
    }
});
//# sourceMappingURL=equal.js.map