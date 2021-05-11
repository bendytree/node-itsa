import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import { ItsaAnything } from "./anything";

interface ItsaArraySettings {
  example?: Itsa;
}

export class ItsaArray extends ItsaAnything {
  constructor() {
    super();

    this.registerActor({
      id: 'array',
      handler: (context:ItsaActorContext, settings:ItsaArraySettings) => {
        const { val, validation, exists, result, type } = context;
        const { example } = settings;

        if (!Array.isArray(val)) return result.addError(`Expected array but found ${type}`);

        if (!example) return;
        if (!val.length) return;

        for (let key=0; key < val.length; key++) {
          const subVal = val[key];
          const subResult = example._validate({
            key,
            parent: val,
            val:subVal,
            exists,
            settings: validation,
          });
          result.combine(subResult);
        }
      }
    });
  }
  array(example?:Itsa):Itsa {
    const settings:ItsaArraySettings = { example };
    this.actions.push({ actorId: 'array', settings });
    return this as any as Itsa;
  }
}


