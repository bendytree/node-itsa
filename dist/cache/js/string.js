"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaString = void 0;
const itsa_1 = require("./itsa");
class ItsaString {
    string() {
        this.predicates.push({ id: 'string', settings: null });
        return this;
    }
}
exports.ItsaString = ItsaString;
itsa_1.Itsa.extend(ItsaString, {
    id: 'string',
    validate: (context) => {
        const { type, result } = context;
        if (type !== 'string')
            return result.addError(`Expected string`);
    }
});
//# sourceMappingURL=string.js.map