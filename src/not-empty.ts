import {Itsa} from "./index";
import {ItsaActorContext} from "./core";
import {ItsaMin} from "./min";

export class ItsaNotEmpty extends ItsaMin {
  constructor() {
    super();

    this.registerActor({
      id: 'notEmpty',
      handler: (context: ItsaActorContext) => {
        const { val, result } = context;
        const len = val ? val.length : null;
        if (typeof len === 'number' && len) {
          return;
        }

        if (Object.prototype.toString.call(val) === "[object Object]") {
          let hasFields = false;
          for (const key in val) {
            if (!val.hasOwnProperty(key)) { continue; }
            hasFields = true;
            break;
          }
          if (!hasFields) {
            result.addError(`Object cannot be empty`);
          }
          return;
        }

        result.addError(`Value cannot be empty`);
      }
    });
  }
  notEmpty():Itsa {
    this.actions.push({ actorId: 'notEmpty', settings:null });
    return this as any as Itsa;
  }
}


