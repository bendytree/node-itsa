
import { ItsaValidateContext } from "./itsa";
import { Itsa } from "./itsa";

export class ItsaDate {
  date(this:Itsa):Itsa{
    this.predicates.push({ id: 'date', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaDate, {
  id: 'date',
  validate: (context:ItsaValidateContext) => {
    const { val, result } = context;
    const type = Object.prototype.toString.call(val);
    if (type !== "[object Date]") {
      return result.registerError(`Expected date but found ${type}`);
    }
    if (!isFinite(val)) {
      result.registerError(`Date is not valid`);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaDate { }
}

