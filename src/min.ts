import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import {ItsaMax} from "./max";

interface ItsaMinSettings {
  min:any;
  inclusive:boolean;
}

export class ItsaMin extends ItsaMax {
  constructor() {
    super();
    this.registerActor({
      id: 'min',
      handler: (context: ItsaActorContext, settings: ItsaMinSettings) => {
        const { val, result } = context;
        const { min, inclusive } = settings;
        if (inclusive) {
          const ok = val >= min;
          if (!ok) result.addError(`Value must be at least ${min}`);
        } else {
          const ok = val > min;
          if (!ok) result.addError(`Value must be greater than ${min}`);
        }
      }
    });
  }
  min(min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMinSettings = { min, inclusive };
    this.actions.push({ actorId: 'min', settings });
    return this as any as Itsa;
  }
  over(min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMinSettings = { min, inclusive };
    this.actions.push({ actorId: 'min', settings });
    return this as any as Itsa;
  }
  above(min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMinSettings = { min, inclusive };
    this.actions.push({ actorId: 'min', settings });
    return this as any as Itsa;
  }
  atLeast(min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMinSettings = { min, inclusive };
    this.actions.push({ actorId: 'min', settings });
    return this as any as Itsa;
  }
}
