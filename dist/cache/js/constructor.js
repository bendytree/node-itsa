"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaConstructor = void 0;
const itsa_1 = require("./itsa");
class ItsaConstructor {
    constructorIs(cls) {
        const settings = { cls };
        this.predicates.push({ id: 'constructor', settings });
        return this;
    }
}
exports.ItsaConstructor = ItsaConstructor;
itsa_1.Itsa.extend(ItsaConstructor, {
    id: 'constructor',
    validate: (context, settings) => {
        const { val, result } = context;
        const isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
        if (!isMatch)
            return result.addError(`Expected to be ${settings.cls}`);
    }
});
//# sourceMappingURL=constructor.js.map