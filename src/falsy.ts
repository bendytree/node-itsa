
import { Itsa, ItsaHandlerContext} from "./index";

export class ItsaFalsy {
  falsy(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'falsy', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaFalsy, {
  id: 'falsy',
  handler: (context:ItsaHandlerContext) => {
    const { val, result } = context;
    if (val) return result.addError(`Expected falsy value.`);
  }
});

declare module './index' {
  interface Itsa extends ItsaFalsy { }
}

