"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaUnique = void 0;
const itsa_1 = require("./itsa");
class ItsaUnique {
    unique(getter) {
        const settings = { getter };
        this.predicates.push({ id: 'unique', settings });
        return this;
    }
}
exports.ItsaUnique = ItsaUnique;
itsa_1.Itsa.extend(ItsaUnique, {
    id: 'unique',
    validate: (context, settings) => {
        const { val, result } = context;
        const { getter } = settings;
        const set = new Set();
        for (const key in val) {
            let subVal = val[key];
            if (getter)
                subVal = getter(subVal);
            if (set.has(subVal)) {
                return result.addError(`${subVal} occurred multiple times`);
            }
            set.add(subVal);
        }
    }
});
//# sourceMappingURL=unique.js.map