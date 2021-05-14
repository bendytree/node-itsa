
import { ItsaHandlerContext } from "./index";
import { Itsa } from "./index";

export class ItsaDate {
  date(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'date', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaDate, {
  id: 'date',
  handler: (context:ItsaHandlerContext) => {
    const { val, result } = context;
    const type = Object.prototype.toString.call(val);
    if (type !== "[object Date]") {
      return result.addError(`Expected date but found ${type}`);
    }
    if (!isFinite(val)) {
      result.addError(`Date is not valid`);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaDate { }
}

