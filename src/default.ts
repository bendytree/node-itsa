
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaDate } from "./date";

export interface ItsaDefaultSettings {
  val?:any;
  falsy?: boolean;
}

export class ItsaDefault extends ItsaDate {
  constructor() {
    super();

    this.registerActor({
      id: 'default',
      handler: (context:ItsaActorContext, settings:ItsaDefaultSettings) => {
        const { val, setVal } = context;
        const falsy = settings.falsy ?? false;
        const doReplace = falsy ? !val : (val === null || val === undefined);
        if (doReplace) {
          setVal(settings.val);
        }
      }
    });

    this.registerActor({
      id: 'defaultNow',
      handler: (context:ItsaActorContext) => {
        const { val, setVal } = context;
        if (val === null || val === undefined) {
          setVal(new Date());
        }
      }
    });
  }
  default(val, settings:ItsaDefaultSettings = {}):Itsa{
    settings.val = val;
    this.actions.push({ actorId: 'default', settings });
    return this as any as Itsa;
  }
  defaultNow():Itsa{
    this.actions.push({ actorId: 'defaultNow', settings:null });
    return this as any as Itsa;
  }
}
