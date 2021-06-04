import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaMinSettings {
  min:any;
  inclusive:boolean;
}

export class ItsaMin {
  min(this: Itsa, min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMinSettings = { min, inclusive };
    this.predicates.push({ id: 'min', settings });
    return this as any as Itsa;
  }
  over(this: Itsa, min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMinSettings = { min, inclusive };
    this.predicates.push({ id: 'min', settings });
    return this as any as Itsa;
  }
  above(this: Itsa, min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? false;
    const settings:ItsaMinSettings = { min, inclusive };
    this.predicates.push({ id: 'min', settings });
    return this as any as Itsa;
  }
  atLeast(this: Itsa, min:any, inclusive?:boolean):Itsa {
    inclusive = inclusive ?? true;
    const settings:ItsaMinSettings = { min, inclusive };
    this.predicates.push({ id: 'min', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaMin, {
  id: 'min',
  validate: (context: ItsaValidateContext, settings: ItsaMinSettings) => {
    const { val, result } = context;
    const { min, inclusive } = settings;
    if (inclusive) {
      const ok = val >= min;
      if (!ok) result.registerError(`Value must be at least ${min}`);
    } else {
      const ok = val > min;
      if (!ok) result.registerError(`Value must be greater than ${min}`);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaMin { }
}
