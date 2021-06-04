
import {Itsa, ItsaValidateContext} from "./itsa";

export interface ItsaBetweenExtraSettings {
  inclusive?:boolean;
}

export interface ItsaBetweenSettings extends ItsaBetweenExtraSettings {
  min:any;
  max:any;
  inclusive?:boolean;
}

export class ItsaBetween {
  between(this:Itsa, min:any, max:any, extraSettings:ItsaBetweenExtraSettings = {}):Itsa{
    const settings = extraSettings as ItsaBetweenSettings;
    settings.min = min;
    settings.max = max;
    this.predicates.push({ id: 'between', settings:settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaBetween, {
  id: 'between',
  validate: (context:ItsaValidateContext, settings:ItsaBetweenSettings) => {
    const { val, result } = context;
    const { min, max } = settings;
    const inclusive = settings.inclusive ?? true;
    const isTooLow = inclusive ? (val < min) : (val <= min);
    if (isTooLow) result.registerError(`Value cannot be under ${min}`);
    const isTooHigh = inclusive ? (val > max) : (val >= max);
    if (isTooHigh) result.registerError(`Value cannot be above ${max}`);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaBetween { }
}
