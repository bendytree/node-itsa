
import { ItsaHandlerContext } from "./index";
import { Itsa } from "./index";

export class ItsaBoolean {
  boolean(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'boolean', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaBoolean, {
  id: 'boolean',
  handler: (context:ItsaHandlerContext) => {
    const { type, result } = context;
    if (type !== 'boolean') result.addError(`Expected bool but found ${type}`);
  }
});

declare module './index' {
  interface Itsa extends ItsaBoolean { }
}
