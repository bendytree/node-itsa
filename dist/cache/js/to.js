"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaTo = void 0;
const itsa_1 = require("./itsa");
class ItsaTo {
    toDate() {
        this.predicates.push({ id: 'toDate', settings: null });
        return this;
    }
    toFloat() {
        this.predicates.push({ id: 'toFloat', settings: null });
        return this;
    }
    toInt(radix) {
        const settings = { radix };
        this.predicates.push({ id: 'toInt', settings });
        return this;
    }
    toLowerCase() {
        this.predicates.push({ id: 'toLowerCase' });
        return this;
    }
    toUpperCase() {
        this.predicates.push({ id: 'toUpperCase' });
        return this;
    }
    toNow() {
        this.predicates.push({ id: 'toNow' });
        return this;
    }
    toString() {
        this.predicates.push({ id: 'toString' });
        return this;
    }
    toTrimmed() {
        this.predicates.push({ id: 'toTrimmed' });
        return this;
    }
}
exports.ItsaTo = ItsaTo;
itsa_1.Itsa.extend(ItsaTo, {
    id: 'toDate',
    validate: (context) => {
        const { val, setVal, result } = context;
        const date = new Date(val);
        if (!isFinite(date.getTime()))
            return result.addError(`Date conversion failed`);
        setVal(date);
    }
}, {
    id: 'toFloat',
    validate: (context) => {
        const { val, setVal, result } = context;
        const newFloat = parseFloat(val);
        if (isNaN(newFloat))
            return result.addError(`Float conversion failed`);
        setVal(newFloat);
    }
}, {
    id: 'toInt',
    validate: (context, settings) => {
        const { val, setVal, result } = context;
        const { radix } = settings;
        const newInt = parseInt(val, radix ?? 10);
        if (isNaN(newInt))
            return result.addError(`Int conversion failed`);
        setVal(newInt);
    }
}, {
    id: 'toLowerCase',
    validate: (context) => {
        const { val, setVal } = context;
        setVal(String(val).toLowerCase());
    }
}, {
    id: 'toUpperCase',
    validate: (context) => {
        const { val, setVal } = context;
        setVal(String(val).toUpperCase());
    }
}, {
    id: 'toNow',
    validate: (context) => {
        const { setVal } = context;
        setVal(new Date());
    }
}, {
    id: 'toString',
    validate: (context) => {
        const { val, setVal } = context;
        setVal(String(val));
    }
}, {
    id: 'toTrimmed',
    validate: (context) => {
        const { val, setVal } = context;
        setVal(String(val).trim());
    }
});
//# sourceMappingURL=to.js.map