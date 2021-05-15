
import { ItsaValidateContext } from "./itsa";
import { Itsa } from "./itsa";

export class ItsaBoolean {
  boolean(this:Itsa):Itsa{
    this.predicates.push({ id: 'boolean', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaBoolean, {
  id: 'boolean',
  validate: (context:ItsaValidateContext) => {
    const { type, result } = context;
    if (type !== 'boolean') result.addError(`Expected bool but found ${type}`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaBoolean { }
}
