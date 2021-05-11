
import {ItsaActorContext} from "./core";
import { Itsa } from "./index";
import {ItsaEqual} from "./equal";

export class ItsaFalsy extends ItsaEqual {
  constructor() {
    super();

    this.registerActor({
      id: 'falsy',
      handler: (context:ItsaActorContext) => {
        const { val, result } = context;
        if (val) return result.addError(`Expected falsy value.`);
      }
    });
  }
  falsy():Itsa{
    this.actions.push({ actorId: 'falsy', settings:null });
    return this as any as Itsa;
  }
}
