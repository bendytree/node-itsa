import { Itsa } from "./index";
import {ItsaActorContext} from "./core";
import {ItsaAny} from "./any";

export class ItsaAnything extends ItsaAny {
  constructor() {
    super();

    this.registerActor({
      id: 'anything',
      handler: (context:ItsaActorContext) => {

      }
    });
  }
  anything():Itsa {
    this.actions.push({ actorId: 'anything', settings:null });
    return this as any as Itsa;
  }
}


