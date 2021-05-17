"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaConvert = void 0;
const itsa_1 = require("./itsa");
class ItsaConvert {
    convert(converter) {
        const settings = { converter };
        this.predicates.push({ id: 'convert', settings });
        return this;
    }
    to(converter) {
        const settings = { converter };
        this.predicates.push({ id: 'convert', settings });
        return this;
    }
}
exports.ItsaConvert = ItsaConvert;
itsa_1.Itsa.extend(ItsaConvert, {
    id: 'convert',
    validate: (context, settings) => {
        const { val, setVal, result } = context;
        const { converter } = settings;
        if (typeof converter !== 'function')
            return;
        try {
            const newVal = converter(val);
            setVal(newVal);
        }
        catch (e) {
            result.addError(e);
        }
    }
});
//# sourceMappingURL=convert.js.map