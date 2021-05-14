import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaNotEmpty {
  notEmpty(this:Itsa):Itsa {
    this.actions.push({ handlerId: 'notEmpty', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaNotEmpty, {
  id: 'notEmpty',
  handler: (context: ItsaHandlerContext) => {
    const { val, result } = context;
    const len = val ? val.length : null;
    if (typeof len === 'number' && len) {
      return;
    }

    if (Object.prototype.toString.call(val) === "[object Object]") {
      let hasFields = false;
      for (const key in val) {
        if (!val.hasOwnProperty(key)) { continue; }
        hasFields = true;
        break;
      }
      if (!hasFields) {
        result.addError(`Object cannot be empty`);
      }
      return;
    }

    result.addError(`Value cannot be empty`);
  }
});

declare module './index' {
  interface Itsa extends ItsaNotEmpty { }
}
