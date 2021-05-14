import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaLengthSettings {
  exactly?:number;
  min?:number;
  max?:number;
}

export class ItsaLength {
  length(this: Itsa, min?:number, max?:number):Itsa {
    let settings:ItsaLengthSettings = {
      min, max
    };
    if (typeof min === 'number' && typeof max !== 'number') {
      settings = { exactly: min };
    }
    if (typeof min !== 'number') {
      settings = { min: 1 };
    }
    this.actions.push({ handlerId: 'length', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaLength, {
  id: 'length',
  handler: (context: ItsaHandlerContext, settings:ItsaLengthSettings) => {
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

declare module './index' {
  interface Itsa extends ItsaLength { }
}
