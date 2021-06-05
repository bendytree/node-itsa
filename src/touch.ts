
import { Itsa } from './itsa';
import { ItsaObjectSettings } from './object';

class ItsaTouch {
  touch<X>(this:Itsa, obj:X, toucher?:(string, X) => void):X {
    const objectPredicates = this.predicates.filter(p => p.id === 'object');
    if (!objectPredicates.length) throw new Error(`This is not an object schema.`);
    if (!obj) return obj;
    for (const predicate of objectPredicates) {
      const settings = predicate.settings as ItsaObjectSettings;
      const example = settings.example as any;
      if (!example) throw new Error(`A schema example is required.`);
      const keys = Object.keys(example);
      for (const key of keys) {
        if (!(key in obj)) {
          if (toucher) {
            toucher(key, obj);
          }else{
            obj[key] = undefined;
          }
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
