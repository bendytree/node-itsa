
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import {ItsaTypeOf} from "./typeof";

interface ItsaUniqueSettings {
  getter?: Function;
}

export class ItsaUnique extends ItsaTypeOf {
  constructor() {
    super();

    this.registerActor({
      id: 'unique',
      handler: (context:ItsaActorContext, settings: ItsaUniqueSettings) => {
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
  }
  unique(getter?:Function):Itsa{
    const settings: ItsaUniqueSettings = { getter };
    this.actions.push({ actorId: 'unique', settings });
    return this as any as Itsa;
  }
}
