
import { Itsa, ItsaValidateContext } from "./itsa";

export interface ItsaEqualSettings {
  strict?:boolean;
  example?:any;
}

export class ItsaEqual {
  equal(this:Itsa, val:any, settings:ItsaEqualSettings = {}):Itsa{
    settings.example = val;
    this.predicates.push({ id: 'equal', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaEqual, {
  id: 'equal',
  validate: (context:ItsaValidateContext, settings:ItsaEqualSettings) => {
    const { val, result } = context;
    const { example } = settings;
    const strict = settings.strict ?? true;
    const isEqual = strict ? (val === example) : (val == example);
    if (!isEqual) {
      result.registerError(`Did not equal ${example}`);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaEqual { }
}

