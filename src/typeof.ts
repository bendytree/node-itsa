
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaTruthy } from "./truthy";

interface ItsaTypeOfSettings {
  type: string;
}

export class ItsaTypeOf extends ItsaTruthy {
  constructor() {
    super();

    this.registerActor({
      id: 'typeof',
      handler: (context:ItsaActorContext, settings: ItsaTypeOfSettings) => {
        const { val, result } = context;
        const { type } = settings;
        const actualType = typeof val;
        if (type !== actualType) {
          result.addError(`Expected ${type}`);
        }
      }
    });
  }
  typeof(type:string):Itsa{
    const settings: ItsaTypeOfSettings = { type };
    this.actions.push({ actorId: 'typeof', settings });
    return this as any as Itsa;
  }
}
