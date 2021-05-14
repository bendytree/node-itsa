
import { ItsaHandlerContext } from "./index";
import { Itsa } from "./index";

export interface ItsaConstructorSettings {
  cls:Function;
}

export class ItsaConstructor {
  constructorIs(this:Itsa, cls:Function):Itsa{
    const settings: ItsaConstructorSettings = { cls };
    this.actions.push({ handlerId: 'constructor', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaConstructor, {
  id: 'constructor',
  handler: (context:ItsaHandlerContext, settings: ItsaConstructorSettings) => {
    const { val, result } = context;
    const isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
    if (!isMatch) return result.addError(`Expected to be ${settings.cls}`);
  }
});

declare module './index' {
  interface Itsa extends ItsaConstructor { }
}
