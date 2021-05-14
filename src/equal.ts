
import { Itsa, ItsaHandlerContext } from "./index";

export interface ItsaEqualSettings {
  strict?:boolean;
  example?:any;
}

export class ItsaEqual {
  equal(this:Itsa, val:any, settings:ItsaEqualSettings = {}):Itsa{
    settings.example = val;
    this.actions.push({ handlerId: 'equal', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaEqual, {
  id: 'equal',
  handler: (context:ItsaHandlerContext, settings:ItsaEqualSettings) => {
    const { val, result } = context;
    const { example } = settings;
    const strict = settings.strict ?? true;
    const isEqual = strict ? (val === example) : (val == example);
    if (!isEqual) {
      result.addError(`Did not equal ${example}`);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaEqual { }
}

