
import { Itsa, ItsaValidator } from './itsa';

function build<T>(schema:Itsa):T {
  for (const predicate of schema.predicates) {
    const validator: ItsaValidator = Itsa.validators[predicate.id];
    if (validator.builder) return validator.builder(predicate.settings);
  }
};

class ItsaBuild {
  build<X>(this:Itsa, overrides?:X):any {
    const obj = build<X>(this) as any;
    if (obj && typeof obj === 'object' && overrides && typeof overrides === 'object') {
      Object.assign(obj, overrides);
    }
    return obj;
  }
}

Itsa.extend(ItsaBuild);

declare module './itsa' {
  interface Itsa extends ItsaBuild { }
}
