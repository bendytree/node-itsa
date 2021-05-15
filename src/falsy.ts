
import { Itsa, ItsaValidateContext} from "./itsa";

export class ItsaFalsy {
  falsy(this:Itsa):Itsa{
    this.predicates.push({ id: 'falsy', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaFalsy, {
  id: 'falsy',
  validate: (context:ItsaValidateContext) => {
    const { val, result } = context;
    if (val) return result.addError(`Expected falsy value.`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaFalsy { }
}

