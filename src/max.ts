import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaMaxSettings {
  max:any;
  inclusive:boolean;
}

export class ItsaMax {
  max(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.predicates.push({ id: 'max', settings });
    return this as any as Itsa;
  }
  under(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.predicates.push({ id: 'max', settings });
    return this as any as Itsa;
  }
  below(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.predicates.push({ id: 'max', settings });
    return this as any as Itsa;
  }
  atMost(this:Itsa, max:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMaxSettings = { max, inclusive };
    this.predicates.push({ id: 'max', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaMax, {
  id: 'max',
  validate: (context: ItsaValidateContext, settings: ItsaMaxSettings) => {
    const { val, result } = context;
    const { max, inclusive } = settings;
    if (inclusive) {
      const ok = val <= max;
      if (!ok) result.registerError(`Value must be at most ${max}`, val);
    } else {
      const ok = val < max;
      if (!ok) result.registerError(`Value must be less than ${max}`, val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaMax { }
}
