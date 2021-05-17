"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaNotEmpty = void 0;
const itsa_1 = require("./itsa");
class ItsaNotEmpty {
    notEmpty() {
        this.predicates.push({ id: 'notEmpty', settings: null });
        return this;
    }
}
exports.ItsaNotEmpty = ItsaNotEmpty;
itsa_1.Itsa.extend(ItsaNotEmpty, {
    id: 'notEmpty',
    validate: (context) => {
        const { val, result } = context;
        const len = val ? val.length : null;
        if (typeof len === 'number' && len) {
            return;
        }
        if (Object.prototype.toString.call(val) === "[object Object]") {
            let hasFields = false;
            for (const key in val) {
                if (!val.hasOwnProperty(key)) {
                    continue;
                }
                hasFields = true;
                break;
            }
            if (!hasFields) {
                result.addError(`Object cannot be empty`);
            }
            return;
        }
        result.addError(`Value cannot be empty`);
    }
});
//# sourceMappingURL=not-empty.js.map