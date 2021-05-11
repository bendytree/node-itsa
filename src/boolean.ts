
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaBetween } from "./between";

export class ItsaBoolean extends ItsaBetween {
  constructor() {
    super();

    this.registerActor({
      id: 'boolean',
      handler: (context:ItsaActorContext) => {
        const { type, result } = context;
        if (type !== 'boolean') result.addError(`Expected bool but found ${type}`);
      }
    });
  }
  boolean():Itsa{
    this.actions.push({ actorId: 'boolean', settings:null });
    return this as any as Itsa;
  }
}
