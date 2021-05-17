"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaBoolean = void 0;
const itsa_1 = require("./itsa");
class ItsaBoolean {
    boolean() {
        this.predicates.push({ id: 'boolean', settings: null });
        return this;
    }
}
exports.ItsaBoolean = ItsaBoolean;
itsa_1.Itsa.extend(ItsaBoolean, {
    id: 'boolean',
    validate: (context) => {
        const { type, result } = context;
        if (type !== 'boolean')
            result.addError(`Expected bool but found ${type}`);
    }
});
//# sourceMappingURL=boolean.js.map