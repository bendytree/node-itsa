import {Itsa, ItsaValidateContext} from "./index";

export class ItsaNumber {
  number(this:Itsa):Itsa {
    this.predicates.push({ id: 'number' });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaNumber, {
  id: 'number',
  validate: (context: ItsaValidateContext) => {
    const {val, type, result} = context;
    if (type !== 'number') return result.addError(`Expected number but type is ${type}.`);
    if (isNaN(val)) return result.addError(`Expected number but found NaN.`);
    if (!isFinite(val)) return result.addError(`Expected number but found infinity.`);
  }
});

declare module './index' {
  interface Itsa extends ItsaNumber { }
}
