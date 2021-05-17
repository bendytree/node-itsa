"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaEmail = void 0;
const itsa_1 = require("./itsa");
const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class ItsaEmail {
    email() {
        this.predicates.push({ id: 'email', settings: null });
        return this;
    }
}
exports.ItsaEmail = ItsaEmail;
itsa_1.Itsa.extend(ItsaEmail, {
    id: 'email',
    validate: (context) => {
        const { val, type, result } = context;
        if (type !== 'string')
            return result.addError(`Expected email but found ${type}`);
        const isValid = rx.test(val);
        if (!isValid) {
            result.addError('Email address is invalid');
        }
    }
});
//# sourceMappingURL=email.js.map