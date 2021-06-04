import {Itsa, ItsaValidateContext} from "./itsa";

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
    this.predicates.push({ id: 'length', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaLength, {
  id: 'length',
  validate: (context: ItsaValidateContext, settings:ItsaLengthSettings) => {
    const {val, result} = context;
    const len = val ? val.length : null;
    if (typeof len !== 'number') {
      return result.registerError('Invalid length');
    }
    if (typeof settings.exactly === 'number' && settings.exactly !== len) {
      return result.registerError(`Expected length to be ${settings.exactly}`);
    }
    if (typeof settings.min === 'number' && settings.min > len) {
      return result.registerError(`Expected length to be at least ${settings.min}`);
    }
    if (typeof settings.max === 'number' && settings.max < len) {
      return result.registerError(`Expected length to be at most ${settings.max}`);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaLength { }
}
