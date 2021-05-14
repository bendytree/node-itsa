
import {Itsa, ItsaValidateContext} from "./index";

interface ItsaTypeOfSettings {
  type: string;
}

export class ItsaTypeOf {
  typeof(this:Itsa, type:string):Itsa{
    const settings: ItsaTypeOfSettings = { type };
    this.predicates.push({ id: 'typeof', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaTypeOf, {
  id: 'typeof',
  validate: (context:ItsaValidateContext, settings: ItsaTypeOfSettings) => {
    const { val, result } = context;
    const { type } = settings;
    const actualType = typeof val;
    if (type !== actualType) {
      result.addError(`Expected ${type}`);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaTypeOf { }
}
