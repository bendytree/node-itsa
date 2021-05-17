"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaMin = void 0;
const itsa_1 = require("./itsa");
class ItsaMin {
    min(min, inclusive) {
        inclusive = inclusive ?? true;
        const settings = { min, inclusive };
        this.predicates.push({ id: 'min', settings });
        return this;
    }
    over(min, inclusive) {
        inclusive = inclusive ?? false;
        const settings = { min, inclusive };
        this.predicates.push({ id: 'min', settings });
        return this;
    }
    above(min, inclusive) {
        inclusive = inclusive ?? false;
        const settings = { min, inclusive };
        this.predicates.push({ id: 'min', settings });
        return this;
    }
    atLeast(min, inclusive) {
        inclusive = inclusive ?? true;
        const settings = { min, inclusive };
        this.predicates.push({ id: 'min', settings });
        return this;
    }
}
exports.ItsaMin = ItsaMin;
itsa_1.Itsa.extend(ItsaMin, {
    id: 'min',
    validate: (context, settings) => {
        const { val, result } = context;
        const { min, inclusive } = settings;
        if (inclusive) {
            const ok = val >= min;
            if (!ok)
                result.addError(`Value must be at least ${min}`);
        }
        else {
            const ok = val > min;
            if (!ok)
                result.addError(`Value must be greater than ${min}`);
        }
    }
});
//# sourceMappingURL=min.js.map