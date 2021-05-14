
import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaUniqueSettings {
  getter?: Function;
}

export class ItsaUnique {
  unique(this:Itsa, getter?:Function):Itsa{
    const settings: ItsaUniqueSettings = { getter };
    this.actions.push({ handlerId: 'unique', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaUnique, {
  id: 'unique',
  handler: (context:ItsaHandlerContext, settings: ItsaUniqueSettings) => {
    const { val, result } = context;
    const { getter } = settings;
    const set = new Set();
    for (const key in val) {
      let subVal = val[key];
      if (getter) subVal = getter(subVal);
      if (set.has(subVal)) {
        return result.addError(`${subVal} occurred multiple times`);
      }
      set.add(subVal);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaUnique { }
}
