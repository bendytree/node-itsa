
import {ItsaActorContext} from "./core";
import { Itsa } from "./index";
import {ItsaObject} from "./object";

export class ItsaString extends ItsaObject {
  constructor() {
    super();

    this.registerActor({
      id: 'string',
      handler: (context:ItsaActorContext) => {
        const { type, result } = context;
        if (type !== 'string') return result.addError(`Expected string`);
      }
    });
  }
  string():Itsa{
    this.actions.push({ actorId: 'string', settings:null });
    return this as any as Itsa;
  }
}
