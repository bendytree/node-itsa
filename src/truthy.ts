
import {Itsa, ItsaValidateContext} from "./index";

export class ItsaTruthy {
  truthy(this:Itsa):Itsa{
    this.predicates.push({ id: 'truthy', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaTruthy, {
  id: 'truthy',
  validate: (context:ItsaValidateContext) => {
    const { val, result } = context;
    if (!val) return result.addError(`Expected truthy value.`);
  }
});

declare module './index' {
  interface Itsa extends ItsaTruthy { }
}
