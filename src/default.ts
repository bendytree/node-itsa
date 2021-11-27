
import { Itsa, ItsaValidateContext } from "./itsa";

export interface ItsaDefaultSettings {
  val?:any;
  falsy?: boolean;
}

export class ItsaDefault {
  default(this:Itsa, val, settings:ItsaDefaultSettings = {}):Itsa{
    settings.val = val;
    this.predicates.push({ id: 'default', settings });
    return this as any as Itsa;
  }
  defaultNow(this:Itsa):Itsa{
    this.predicates.push({ id: 'defaultNow', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(
  ItsaDefault,
  ...[
    {
      id: 'default',
      builder(settings:ItsaDefaultSettings) {
        return settings.val;
      },
      validate: (context:ItsaValidateContext, settings:ItsaDefaultSettings) => {
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
      builder(settings:ItsaDefaultSettings) {
        return new Date();
      },
      validate: (context:ItsaValidateContext) => {
        const { val, setVal } = context;
        if (val === null || val === undefined) {
          setVal(new Date());
        }
      }
    }
  ]
);

declare module './itsa' {
  interface Itsa extends ItsaDefault { }
}

