
import { Itsa, ItsaValidator } from './itsa';
import { ItsaObjectSettings } from './object';

function build<T>(schema:Itsa, overrides?:T):T {
  const objectPredicates = schema.predicates.filter(p => p.id === 'object');
  if (objectPredicates.length) {
    const built = {} as T;
    for (const predicate of objectPredicates) {
      const settings = predicate.settings as ItsaObjectSettings;
      const example = settings.example as any;
      if (!example) continue;
      const keys = Object.keys(example);
      for (const key of keys) {
        const schemaForKey = example[key];
        built[key] = build(schemaForKey);
      }
    }
    return built;
  }

  for (const predicate of schema.predicates) {
    const validator: ItsaValidator = Itsa.validators[predicate.id];
    if (validator.builder) return validator.builder(predicate.settings);
  }

  return undefined;
};

class ItsaBuild {
  build<X>(this:Itsa, overrides?:X):any {
    return build<X>(this, overrides) as any;
  }
}

Itsa.extend(ItsaBuild);

declare module './itsa' {
  interface Itsa extends ItsaBuild { }
}
