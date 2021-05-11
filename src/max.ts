import { Itsa } from "./index";
import { ItsaMatches } from "./matches";
import { ItsaActorContext } from "./core";

interface ItsaMaxSettings {
  max:any;
  inclusive:boolean;
}

export class ItsaMax extends ItsaMatches {
  constructor() {
    super();
    this.registerActor({
      id: 'max',
      handler: (context: ItsaActorContext, settings: ItsaMaxSettings) => {
        const { val, result } = context;
        const { max, inclusive } = settings;
        if (inclusive) {
          const ok = val <= max;
          if (!ok) result.addError(`Value must be at most ${max}`);
        } else {
          const ok = val < max;
          if (!ok) result.addError(`Value must be less than ${max}`);
        }
      }
    });
  }
  max(max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ actorId: 'max', settings });
    return this as any as Itsa;
  }
  under(max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ actorId: 'max', settings });
    return this as any as Itsa;
  }
  below(max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ actorId: 'max', settings });
    return this as any as Itsa;
  }
  atMost(max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ actorId: 'max', settings });
    return this as any as Itsa;
  }
}
