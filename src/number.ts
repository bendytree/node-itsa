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
    if (type !== 'number') return result.registerError(`Expected number but type is ${type}.`, val);
    if (isNaN(val)) return result.registerError(`Expected number but found NaN.`, val);
    if (!isFinite(val)) return result.registerError(`Expected number but found infinity.`, val);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaNumber { }
}
