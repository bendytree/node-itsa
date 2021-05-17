"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaVerify = void 0;
const itsa_1 = require("./itsa");
class ItsaVerify {
    verify(verifier) {
        const settings = { verifier };
        this.predicates.push({ id: 'verify', settings });
        return this;
    }
}
exports.ItsaVerify = ItsaVerify;
itsa_1.Itsa.extend(ItsaVerify, {
    id: 'verify',
    validate: (context, settings) => {
        const { val, result } = context;
        const { verifier } = settings;
        try {
            const response = verifier(val);
            if (typeof response === 'boolean') {
                if (response === false) {
                    result.addError(`Value is invalid`);
                }
                return;
            }
            if (typeof response === 'string') {
                return result.addError(response);
            }
        }
        catch (e) {
            if (e === 'STOP_ON_FIRST_ERROR')
                throw e;
            return result.addError(e);
        }
    }
});
//# sourceMappingURL=verify.js.map