import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import { ItsaFunction } from "./function";

interface ItsaInstanceOfSettings {
  cls: any;
}

export class ItsaInstanceOf extends ItsaFunction {
  constructor() {
    super();

    this.registerActor({
      id: 'instanceof',
      handler: (context: ItsaActorContext, settings:ItsaInstanceOfSettings) => {
        const {val, result} = context;
        const isInstance = val instanceof settings.cls;
        if (!isInstance) {
          result.addError(`Expected instance of ${settings.cls}`);
        }
      }
    });
  }
  instanceof(cls:any):Itsa {
    const settings:ItsaInstanceOfSettings = { cls };
    this.actions.push({ actorId: 'instanceof', settings });
    return this as any as Itsa;
  }
}
