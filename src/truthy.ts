
import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaTruthy {
  truthy(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'truthy', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaTruthy, {
  id: 'truthy',
  handler: (context:ItsaHandlerContext) => {
    const { val, result } = context;
    if (!val) return result.addError(`Expected truthy value.`);
  }
});

declare module './index' {
  interface Itsa extends ItsaTruthy { }
}
