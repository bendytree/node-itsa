
import {Itsa, ItsaValidateContext} from "./itsa";

export class ItsaString {
  string(this:Itsa):Itsa{
    this.predicates.push({ id: 'string', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaString, {
  id: 'string',
  validate: (context:ItsaValidateContext) => {
    const { type, result } = context;
    if (type !== 'string') return result.registerError(`Expected string`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaString { }
}
