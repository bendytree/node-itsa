"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.primitiveToItsa = void 0;
const itsa_1 = require("./itsa");
function primitiveToItsa(val) {
    if (val instanceof itsa_1.Itsa) {
        return val;
    }
    else if (typeof val === 'function') {
        return itsa_1.itsa.constructorIs(val);
    }
    else {
        return itsa_1.itsa.equal(val);
    }
}
exports.primitiveToItsa = primitiveToItsa;
//# sourceMappingURL=helpers.js.map