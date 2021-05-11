
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaBoolean } from "./boolean";

export interface ItsaConstructorSettings {
  cls:Function;
}

export class ItsaConstructor extends ItsaBoolean {
  constructor() {
    super();

    this.registerActor({
      id: 'constructor',
      handler: (context:ItsaActorContext, settings: ItsaConstructorSettings) => {
        const { val, result } = context;
        const isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
        if (!isMatch) return result.addError(`Expected to be ${settings.cls}`);
      }
    });
  }
  constructorIs(cls:Function):Itsa{
    const settings: ItsaConstructorSettings = { cls };
    this.actions.push({ actorId: 'constructor', settings });
    return this as any as Itsa;
  }
}
