
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaConvert } from "./convert";

export class ItsaDate extends ItsaConvert {
  constructor() {
    super();

    this.registerActor({
      id: 'date',
      handler: (context:ItsaActorContext) => {
        const { val, result } = context;
        const type = Object.prototype.toString.call(val);
        if (type !== "[object Date]") {
          result.addError(`Expected date but found ${type}`);
          return;
        }
        if (!isFinite(val)) {
          result.addError(`Date is not valid`);
        }
      }
    });
  }
  date():Itsa{
    this.actions.push({ actorId: 'date', settings:null });
    return this as any as Itsa;
  }
}
