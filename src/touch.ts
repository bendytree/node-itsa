
import { Itsa } from './itsa';
import { ItsaObjectSettings } from './object';

class ItsaTouch {
  touch<X>(this:Itsa, obj:X):X {
    const objectPredicates = this.predicates.filter(p => p.id === 'object');
    if (!objectPredicates.length) throw new Error(`This is not an object schema.`);
    if (!obj) throw new Error(`The given obj cannot be falsy.`);
    for (const predicate of objectPredicates) {
      const settings = predicate.settings as ItsaObjectSettings;
      const example = settings.example as any;
      if (!example) throw new Error(`A schema example is required.`);
      const keys = Object.keys(example);
      for (const key of keys) {
        if (!(key in obj)) {
          obj[key] = undefined;
        }
      }
    }
    return obj;
  }
}

Itsa.extend(ItsaTouch);

declare module './itsa' {
  interface Itsa extends ItsaTouch { }
}
