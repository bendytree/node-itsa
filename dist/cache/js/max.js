"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaMax = void 0;
const itsa_1 = require("./itsa");
class ItsaMax {
    max(max, inclusive) {
        inclusive = inclusive ?? true;
        const settings = { max, inclusive };
        this.predicates.push({ id: 'max', settings });
        return this;
    }
    under(max, inclusive) {
        inclusive = inclusive ?? false;
        const settings = { max, inclusive };
        this.predicates.push({ id: 'max', settings });
        return this;
    }
    below(max, inclusive) {
        inclusive = inclusive ?? false;
        const settings = { max, inclusive };
        this.predicates.push({ id: 'max', settings });
        return this;
    }
    atMost(max, inclusive) {
        inclusive = inclusive ?? true;
        const settings = { max, inclusive };
        this.predicates.push({ id: 'max', settings });
        return this;
    }
}
exports.ItsaMax = ItsaMax;
itsa_1.Itsa.extend(ItsaMax, {
    id: 'max',
    validate: (context, settings) => {
        const { val, result } = context;
        const { max, inclusive } = settings;
        if (inclusive) {
            const ok = val <= max;
            if (!ok)
                result.addError(`Value must be at most ${max}`);
        }
        else {
            const ok = val < max;
            if (!ok)
                result.addError(`Value must be less than ${max}`);
        }
    }
});
//# sourceMappingURL=max.js.map