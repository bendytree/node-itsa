"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaFalsy = void 0;
const itsa_1 = require("./itsa");
class ItsaFalsy {
    falsy() {
        this.predicates.push({ id: 'falsy', settings: null });
        return this;
    }
}
exports.ItsaFalsy = ItsaFalsy;
itsa_1.Itsa.extend(ItsaFalsy, {
    id: 'falsy',
    validate: (context) => {
        const { val, result } = context;
        if (val)
            return result.addError(`Expected falsy value.`);
    }
});
//# sourceMappingURL=falsy.js.map