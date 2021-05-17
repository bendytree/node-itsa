"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaTypeOf = void 0;
const itsa_1 = require("./itsa");
class ItsaTypeOf {
    typeof(type) {
        const settings = { type };
        this.predicates.push({ id: 'typeof', settings });
        return this;
    }
}
exports.ItsaTypeOf = ItsaTypeOf;
itsa_1.Itsa.extend(ItsaTypeOf, {
    id: 'typeof',
    validate: (context, settings) => {
        const { val, result } = context;
        const { type } = settings;
        const actualType = typeof val;
        if (type !== actualType) {
            result.addError(`Expected ${type}`);
        }
    }
});
//# sourceMappingURL=typeof.js.map