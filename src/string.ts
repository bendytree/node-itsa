
import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaString {
  string(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'string', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaString, {
  id: 'string',
  handler: (context:ItsaHandlerContext) => {
    const { type, result } = context;
    if (type !== 'string') return result.addError(`Expected string`);
  }
});

declare module './index' {
  interface Itsa extends ItsaString { }
}
