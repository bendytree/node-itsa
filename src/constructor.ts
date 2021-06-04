
import { ItsaValidateContext } from "./itsa";
import { Itsa } from "./itsa";

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
    if (!isMatch) return result.registerError(`Expected to be ${settings.cls}`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaConstructor { }
}
