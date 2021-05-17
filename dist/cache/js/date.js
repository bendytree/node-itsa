"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaDate = void 0;
const itsa_1 = require("./itsa");
class ItsaDate {
    date() {
        this.predicates.push({ id: 'date', settings: null });
        return this;
    }
}
exports.ItsaDate = ItsaDate;
itsa_1.Itsa.extend(ItsaDate, {
    id: 'date',
    validate: (context) => {
        const { val, result } = context;
        const type = Object.prototype.toString.call(val);
        if (type !== "[object Date]") {
            return result.addError(`Expected date but found ${type}`);
        }
        if (!isFinite(val)) {
            result.addError(`Date is not valid`);
        }
    }
});
//# sourceMappingURL=date.js.map