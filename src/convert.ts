
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaConstructor} from "./constructor";

export interface ItsaConvertSettings {
  converter:Function;
}

export class ItsaConvert extends ItsaConstructor {
  constructor() {
    super();

    this.registerActor({
      id: 'convert',
      handler: (context:ItsaActorContext, settings: ItsaConvertSettings) => {
        const { val, setVal, result } = context;
        const { converter } = settings;
        if (typeof converter !== 'function') return;
        try {
          const newVal = converter(val);
          setVal(newVal);
        }catch(e){
          result.addError(e);
        }
      }
    });
  }
  convert(converter:Function):Itsa{
    const settings: ItsaConvertSettings = { converter };
    this.actions.push({ actorId: 'convert', settings });
    return this as any as Itsa;
  }
  to(converter:Function):Itsa{
    const settings: ItsaConvertSettings = { converter };
    this.actions.push({ actorId: 'convert', settings });
    return this as any as Itsa;
  }
}
