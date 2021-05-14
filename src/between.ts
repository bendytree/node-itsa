
import {Itsa, ItsaHandlerContext} from "./index";

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
    this.actions.push({ handlerId: 'between', settings:settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaBetween, {
  id: 'between',
  handler: (context:ItsaHandlerContext, settings:ItsaBetweenSettings) => {
    const { val, result } = context;
    const { min, max } = settings;
    const inclusive = settings.inclusive ?? true;
    const isTooLow = inclusive ? (val < min) : (val <= min);
    if (isTooLow) result.addError(`Value cannot be under ${min}`);
    const isTooHigh = inclusive ? (val > max) : (val >= max);
    if (isTooHigh) result.addError(`Value cannot be above ${max}`);
  }
});

declare module './index' {
  interface Itsa extends ItsaBetween { }
}
