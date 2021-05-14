
import { Itsa, ItsaValidateContext } from "./index";

export interface ItsaConvertSettings {
  converter:Function;
}

export class ItsaConvert {
  convert(this:Itsa, converter:Function):Itsa{
    const settings: ItsaConvertSettings = { converter };
    this.predicates.push({ id: 'convert', settings });
    return this as any as Itsa;
  }
  to(this:Itsa, converter:Function):Itsa{
    const settings: ItsaConvertSettings = { converter };
    this.predicates.push({ id: 'convert', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaConvert, {
  id: 'convert',
  validate: (context:ItsaValidateContext, settings: ItsaConvertSettings) => {
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

declare module './index' {
  interface Itsa extends ItsaConvert { }
}

