"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaLength = void 0;
const itsa_1 = require("./itsa");
class ItsaLength {
    length(min, max) {
        let settings = {
            min, max
        };
        if (typeof min === 'number' && typeof max !== 'number') {
            settings = { exactly: min };
        }
        if (typeof min !== 'number') {
            settings = { min: 1 };
        }
        this.predicates.push({ id: 'length', settings });
        return this;
    }
}
exports.ItsaLength = ItsaLength;
itsa_1.Itsa.extend(ItsaLength, {
    id: 'length',
    validate: (context, settings) => {
        const { val, result } = context;
        const len = val ? val.length : null;
        if (typeof len !== 'number') {
            return result.addError('Invalid length');
        }
        if (typeof settings.exactly === 'number' && settings.exactly !== len) {
            return result.addError(`Expected length to be ${settings.exactly}`);
        }
        if (typeof settings.min === 'number' && settings.min > len) {
            return result.addError(`Expected length to be at least ${settings.min}`);
        }
        if (typeof settings.max === 'number' && settings.max < len) {
            return result.addError(`Expected length to be at most ${settings.max}`);
        }
    }
});
//# sourceMappingURL=length.js.map