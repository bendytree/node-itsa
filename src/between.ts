
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import { ItsaArray } from "./array";

export interface ItsaBetweenExtraSettings {
  inclusive?:boolean;
}

export interface ItsaBetweenSettings extends ItsaBetweenExtraSettings {
  min:any;
  max:any;
  inclusive?:boolean;
}

export class ItsaBetween extends ItsaArray {
  constructor() {
    super();

    this.registerActor({
      id: 'between',
      handler: (context:ItsaActorContext, settings:ItsaBetweenSettings) => {
        const { val, result } = context;
        const { min, max } = settings;
        const inclusive = settings.inclusive ?? true;
        const isTooLow = inclusive ? (val < min) : (val <= min);
        if (isTooLow) result.addError(`Value cannot be under ${min}`);
        const isTooHigh = inclusive ? (val > max) : (val >= max);
        if (isTooHigh) result.addError(`Value cannot be above ${max}`);
      }
    });
  }
  between(min:any, max:any, extraSettings:ItsaBetweenExtraSettings = {}):Itsa{
    const settings = extraSettings as ItsaBetweenSettings;
    settings.min = min;
    settings.max = max;
    this.actions.push({ actorId: 'between', settings:settings });
    return this as any as Itsa;
  }
}
