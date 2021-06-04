import {Itsa, ItsaValidateContext} from "./itsa";

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
    if (type !== 'number') return result.registerError(`Expected number but type is ${type}.`);
    if (isNaN(val)) return result.registerError(`Expected number but found NaN.`);
    if (!isFinite(val)) return result.registerError(`Expected number but found infinity.`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaNumber { }
}
