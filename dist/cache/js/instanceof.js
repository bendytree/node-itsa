"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaInstanceOf = void 0;
const itsa_1 = require("./itsa");
class ItsaInstanceOf {
    instanceof(cls) {
        const settings = { cls };
        this.predicates.push({ id: 'instanceof', settings });
        return this;
    }
}
exports.ItsaInstanceOf = ItsaInstanceOf;
itsa_1.Itsa.extend(ItsaInstanceOf, {
    id: 'instanceof',
    validate: (context, settings) => {
        const { val, result } = context;
        const isInstance = val instanceof settings.cls;
        if (!isInstance) {
            result.addError(`Expected instance of ${settings.cls}`);
        }
    }
});
//# sourceMappingURL=instanceof.js.map