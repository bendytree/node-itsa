import {Itsa} from "./index";
import {ItsaActorContext} from "./core";
import {ItsaNull} from "./null";

export class ItsaNumber extends ItsaNull {
  constructor() {
    super();

    this.registerActor({
      id: 'number',
      handler: (context: ItsaActorContext) => {
        const {val, type, result} = context;
        if (type !== 'number') return result.addError(`Expected number but type is ${type}.`);
        if (isNaN(val)) return result.addError(`Expected number but found NaN.`);
        if (!isFinite(val)) return result.addError(`Expected number but found infinity.`);
      }
    });
  }
  number():Itsa {
    this.actions.push({ actorId: 'number', settings: null });
    return this as any as Itsa;
  }
}


