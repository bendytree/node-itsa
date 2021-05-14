
import {Itsa, ItsaValidateContext} from "./index";

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
    if (type !== 'string') return result.addError(`Expected string`);
  }
});

declare module './index' {
  interface Itsa extends ItsaString { }
}
