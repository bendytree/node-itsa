"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaMatches = void 0;
const itsa_1 = require("./itsa");
class ItsaMatches {
    matches(regex) {
        const settings = { regex };
        this.predicates.push({ id: 'matches', settings });
        return this;
    }
}
exports.ItsaMatches = ItsaMatches;
itsa_1.Itsa.extend(ItsaMatches, {
    id: 'matches',
    validate: (context, settings) => {
        const { val, result } = context;
        const valid = settings.regex.test(String(val));
        if (!valid) {
            result.addError(`Does not match ${settings.regex}`);
        }
    }
});
//# sourceMappingURL=matches.js.map