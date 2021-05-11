
import {ItsaActorContext} from "./core";
import { Itsa } from "./index";
import {ItsaTo} from "./to";

export class ItsaTruthy extends ItsaTo {
  constructor() {
    super();

    this.registerActor({
      id: 'truthy',
      handler: (context:ItsaActorContext) => {
        const { val, result } = context;
        if (!val) return result.addError(`Expected truthy value.`);
      }
    });
  }
  truthy():Itsa{
    this.actions.push({ actorId: 'truthy', settings:null });
    return this as any as Itsa;
  }
}
