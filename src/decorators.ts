
import { Itsa, itsa } from "./itsa";
import { ItsaObjectSettings } from './object';

const combineSchemas = (target:Itsa, source:Itsa) => {
  for (const p of source.predicates) {
    if (p.id === 'object') {
      const settings = p.settings as ItsaObjectSettings;
      if (settings.example) {
        for (const key of Object.keys(settings.example)) {
          target.addProperty(key, settings.example[key]);
        }
      }
    }else{
      target.predicates.push(p);
    }
  }

  // If any allow extras, all should
  const allowExtras = !!source.predicates.find(p => p.id === 'object' && p.settings?.config?.extras === true);
  if (allowExtras) {
    target.predicates.filter(p => p.id === 'object').forEach(p => p.settings.config.extras = true);
  }
};

export class ItsaSchema {
  static schema: Itsa;
  constructor(overrides?) {
    const schema = (this as any).constructor.schema;
    return schema.build(overrides);
  }
}

export function itsaSchema (schema?:Itsa):any {
  return function (target: any, key?: string) {
    if (key) {
      return itsaField(schema)(target, key);
    }
    if (target.schema && schema) {
      combineSchemas(target.schema, schema);
    }else if (schema) {
      target.schema = schema;
    }else if (target.schema) {
      // nothing to do
    }else{
      target.schema = itsa.object({});
    }
  };
}

export function itsaField (schema:Itsa) {
  if (schema === undefined) throw new Error(`itsaSchema field schema may not be undefined`);
  return function (target: any, key: string) {
    const cls = target.constructor;
    if (!Object.getOwnPropertyDescriptor(cls, 'schema')) {
      const parentSchema = cls.schema;
      cls.schema = parentSchema ? parentSchema.clone() : itsa.object({});
    }
    cls.schema.addProperty(key, schema);
  };
}
