
import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaUniqueSettings {
  getter?: Function;
}

export class ItsaUnique {
  unique(this:Itsa, getter?:Function):Itsa{
    const settings: ItsaUniqueSettings = { getter };
    this.predicates.push({ id: 'unique', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaUnique, {
  id: 'unique',
  validate: (context:ItsaValidateContext, settings: ItsaUniqueSettings) => {
    const { val, result } = context;
    const { getter } = settings;
    const set = new Set();
    for (const key in val) {
      let subVal = val[key];
      if (getter) subVal = getter(subVal);
      if (set.has(subVal)) {
        return result.registerError(`${subVal} occurred multiple times`);
      }
      set.add(subVal);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaUnique { }
}
