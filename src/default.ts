
import { Itsa, ItsaHandlerContext } from "./index";

export interface ItsaDefaultSettings {
  val?:any;
  falsy?: boolean;
}

export class ItsaDefault {
  default(this:Itsa, val, settings:ItsaDefaultSettings = {}):Itsa{
    settings.val = val;
    this.actions.push({ handlerId: 'default', settings });
    return this as any as Itsa;
  }
  defaultNow(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'defaultNow', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(
  ItsaDefault,
  ...[
    {
      id: 'default',
      handler: (context:ItsaHandlerContext, settings:ItsaDefaultSettings) => {
        const { val, setVal } = context;
        const falsy = settings.falsy ?? false;
        const doReplace = falsy ? !val : (val === null || val === undefined);
        if (doReplace) {
          setVal(settings.val);
        }
      }
    },
    {
      id: 'defaultNow',
      handler: (context:ItsaHandlerContext) => {
        const { val, setVal } = context;
        if (val === null || val === undefined) {
          setVal(new Date());
        }
      }
    }
  ]
);

declare module './index' {
  interface Itsa extends ItsaDefault { }
}

