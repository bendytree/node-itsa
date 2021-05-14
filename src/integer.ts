import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaInteger {
  integer(this:Itsa):Itsa {
    this.actions.push({ handlerId: 'integer', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaInteger, {
  id: 'integer',
  handler: (context: ItsaHandlerContext) => {
    const {val, result} = context;
    const valid = typeof val === "number"
      && isNaN(val) === false
      && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
      && val % 1 === 0;
    if (!valid) {
      result.addError('Invalid integer');
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaInteger { }
}
