"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaTruthy = void 0;
const itsa_1 = require("./itsa");
class ItsaTruthy {
    truthy() {
        this.predicates.push({ id: 'truthy', settings: null });
        return this;
    }
}
exports.ItsaTruthy = ItsaTruthy;
itsa_1.Itsa.extend(ItsaTruthy, {
    id: 'truthy',
    validate: (context) => {
        const { val, result } = context;
        if (!val)
            return result.addError(`Expected truthy value.`);
    }
});
//# sourceMappingURL=truthy.js.map