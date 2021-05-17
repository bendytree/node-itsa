"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaArray = void 0;
const itsa_1 = require("./itsa");
const helpers_1 = require("./helpers");
class ItsaArray {
    array(example) {
        const settings = { example: example ? helpers_1.primitiveToItsa(example) : null };
        this.predicates.push({ id: 'array', settings });
        return this;
    }
}
exports.ItsaArray = ItsaArray;
itsa_1.Itsa.extend(ItsaArray, {
    id: 'array',
    validate: (context, settings) => {
        const { val, validation, exists, result, type } = context;
        const { example } = settings;
        if (!Array.isArray(val))
            return result.addError(`Expected array but found ${type}`);
        if (!example)
            return;
        if (!val.length)
            return;
        for (let key = 0; key < val.length; key++) {
            const subVal = val[key];
            const subResult = example._validate({
                key,
                parent: val,
                val: subVal,
                exists,
                settings: validation,
                path: [...context.path, key],
            });
            result.combine(subResult);
        }
    }
});
//# sourceMappingURL=array.js.map