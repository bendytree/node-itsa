import {Itsa, ItsaValidateContext} from "./itsa";

export class ItsaInteger {
  integer(this:Itsa):Itsa {
    this.predicates.push({ id: 'integer', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaInteger, {
  id: 'integer',
  validate: (context: ItsaValidateContext) => {
    const {val, result} = context;
    const valid = typeof val === "number"
      && isNaN(val) === false
      && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
      && val % 1 === 0;
    if (!valid) {
      result.registerError('Invalid integer', val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaInteger { }
}
