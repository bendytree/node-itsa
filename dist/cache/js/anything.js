"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaAnything = void 0;
const itsa_1 = require("./itsa");
class ItsaAnything {
    anything() {
        this.predicates.push({ id: 'anything', settings: null });
        return this;
    }
}
exports.ItsaAnything = ItsaAnything;
itsa_1.Itsa.extend(ItsaAnything, {
    id: 'anything',
    validate: (context) => {
    }
});
//# sourceMappingURL=anything.js.map