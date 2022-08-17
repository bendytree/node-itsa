import {Itsa, ItsaValidateContext} from "./itsa";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";
import { ItsaObjectSettings } from './object';

interface ItsaArraySettings {
  example?: Itsa;
}

export class ItsaArray {
  array(this:Itsa, example?:ItsaOrPrimative):Itsa {
    const settings:ItsaArraySettings = { example: example ? primitiveToItsa(example) : null };
    this.predicates.push({ id: 'array', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaArray, {
  id: 'array',
  builder(settings: ItsaArraySettings) {
    return [];
  },
  validate: (context:ItsaValidateContext, settings:ItsaArraySettings) => {
    const { val, validation, exists, result, type } = context;
    const { example } = settings;

    if (!Array.isArray(val)) return result.registerError(`Expected array but found ${type}`, val);

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
        path: [...context.path, key],
      });
      result.registerResult(subResult);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaArray { }
}
