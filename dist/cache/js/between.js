"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaBetween = void 0;
const itsa_1 = require("./itsa");
class ItsaBetween {
    between(min, max, extraSettings = {}) {
        const settings = extraSettings;
        settings.min = min;
        settings.max = max;
        this.predicates.push({ id: 'between', settings: settings });
        return this;
    }
}
exports.ItsaBetween = ItsaBetween;
itsa_1.Itsa.extend(ItsaBetween, {
    id: 'between',
    validate: (context, settings) => {
        const { val, result } = context;
        const { min, max } = settings;
        const inclusive = settings.inclusive ?? true;
        const isTooLow = inclusive ? (val < min) : (val <= min);
        if (isTooLow)
            result.addError(`Value cannot be under ${min}`);
        const isTooHigh = inclusive ? (val > max) : (val >= max);
        if (isTooHigh)
            result.addError(`Value cannot be above ${max}`);
    }
});
//# sourceMappingURL=between.js.map