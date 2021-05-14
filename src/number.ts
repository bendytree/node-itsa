import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaNumber {
  number(this:Itsa):Itsa {
    this.actions.push({ handlerId: 'number', settings: null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaNumber, {
  id: 'number',
  handler: (context: ItsaHandlerContext) => {
    const {val, type, result} = context;
    if (type !== 'number') return result.addError(`Expected number but type is ${type}.`);
    if (isNaN(val)) return result.addError(`Expected number but found NaN.`);
    if (!isFinite(val)) return result.addError(`Expected number but found infinity.`);
  }
});

declare module './index' {
  interface Itsa extends ItsaNumber { }
}
