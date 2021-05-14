
import { ItsaValidateContext } from "./index";
import { Itsa } from "./index";

export interface ItsaConstructorSettings {
  cls:Function;
}

export class ItsaConstructor {
  constructorIs(this:Itsa, cls:Function):Itsa{
    const settings: ItsaConstructorSettings = { cls };
    this.predicates.push({ id: 'constructor', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaConstructor, {
  id: 'constructor',
  validate: (context:ItsaValidateContext, settings: ItsaConstructorSettings) => {
    const { val, result } = context;
    const isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
    if (!isMatch) return result.addError(`Expected to be ${settings.cls}`);
  }
});

declare module './index' {
  interface Itsa extends ItsaConstructor { }
}
