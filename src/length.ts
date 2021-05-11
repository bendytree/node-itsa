import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import {ItsaInteger} from "./integer";

interface ItsaLengthSettings {
  exactly?:number;
  min?:number;
  max?:number;
}

export class ItsaLength extends ItsaInteger {
  constructor() {
    super();

    this.registerActor({
      id: 'length',
      handler: (context: ItsaActorContext, settings:ItsaLengthSettings) => {
        const {val, result} = context;
        const len = val ? val.length : null;
        if (typeof len !== 'number') {
          return result.addError('Invalid length');
        }
        if (typeof settings.exactly === 'number' && settings.exactly !== len) {
          return result.addError(`Expected length to be ${settings.exactly}`);
        }
        if (typeof settings.min === 'number' && settings.min > len) {
          return result.addError(`Expected length to be at least ${settings.min}`);
        }
        if (typeof settings.max === 'number' && settings.max < len) {
          return result.addError(`Expected length to be at most ${settings.max}`);
        }
      }
    });
  }
  length(min?:number, max?:number):Itsa {
    let settings:ItsaLengthSettings = {
      min, max
    };
    if (typeof min === 'number' && typeof max !== 'number') {
      settings = { exactly: min };
    }
    if (typeof min !== 'number') {
      settings = { min: 1 };
    }
    this.actions.push({ actorId: 'length', settings });
    return this as any as Itsa;
  }
}
