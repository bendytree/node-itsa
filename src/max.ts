import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaMaxSettings {
  max:any;
  inclusive:boolean;
}

export class ItsaMax {
  max(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ handlerId: 'max', settings });
    return this as any as Itsa;
  }
  under(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ handlerId: 'max', settings });
    return this as any as Itsa;
  }
  below(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ handlerId: 'max', settings });
    return this as any as Itsa;
  }
  atMost(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.actions.push({ handlerId: 'max', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaMax, {
  id: 'max',
  handler: (context: ItsaHandlerContext, settings: ItsaMaxSettings) => {
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

declare module './index' {
  interface Itsa extends ItsaMax { }
}
