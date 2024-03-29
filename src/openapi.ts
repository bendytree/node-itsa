
import {Itsa, ItsaPredicate, ItsaValidateContext} from './itsa';

function getOpenApiTypeForValue(val: any) {
  if (typeof val === 'string') return 'string';
  if (typeof val === 'number') return (val % 1 === 0) ? 'integer' : 'number';
  if (typeof val === 'boolean') return 'boolean';
  if (val === null || val === undefined) return 'null'; // Note: OpenAPI 3.1 supports 'null', but 3.0 does not.
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object') return 'object';
}

export interface ItsaSchemaSettings {
  description?: string;
  example?: any;
  default?: any;
  title?: any;
  [key: string]: any;
  _defaults?: Omit<ItsaSchemaSettings, '_defaults'>;
}

export interface IToOpenApiSchemaParams {
  toRef?(schema:any):string | null | undefined;
  isRoot?: boolean;
}

class ItsaOpenApiSchema {

  schema(this: Itsa, settings: ItsaSchemaSettings): Itsa {
    this.predicates.push({ id: 'schema', settings });
    return this;
  }

  toOpenApiSchema<X>(this:Itsa, params?:IToOpenApiSchemaParams):any {
    if (!params) { params = {}; }
    if (!('isRoot' in params)) params.isRoot = true;

    const lookup = {} as Record<string, ItsaPredicate>;
    const predicates = this.predicates;
    for (const p of predicates) { lookup[p.id] = p; }

    const schema:any = (() => {
      if (lookup['object']) {
        const properties = {} as any;
        const required = [];
        for (const key of this.keys()) {
          const keySchema = this.get(key);
          if (keySchema.isRequired()) required.push(key);
          properties[key] = keySchema.toOpenApiSchema({ ...params, isRoot: false });
        }
        return {
          type: 'object',
          required,
          properties,
        };
      }

      if (lookup['array']) {
        const example = lookup['array'].settings?.example;
        return {
          type: 'array',
          ...(example ? { items: example.toOpenApiSchema({ ...params, isRoot: false }) } : {}),
        };
      }

      if (lookup['string'] || lookup['email']) {
        const s = { type: 'string' } as any;
        if (lookup['email']) s.format = 'email';
        if (lookup['matches']) {
          const rx = lookup['matches'].settings?.regex;
          const match = rx.toString().match(/^\/(.*?)\/([gimyus]*)$/);
          if (match) { s.pattern = match[1]; }
        }
        return s;
      }

      if (lookup['number']) {
        return { type: 'number' };
      }

      if (lookup['integer']) {
        return { type: 'integer' };
      }

      if (lookup['boolean']) {
        return { type: 'boolean' };
      }

      if (lookup['null']) {
        return { type: 'null' };
      }

      if (lookup['objectid']) {
        return { type: 'string', minLength: 24, maxLength: 24, pattern: '^[0-9a-f]$' };
      }

      if (lookup['date']) {
        return { type: 'date', format: 'date-time' };
      }

      if (lookup['equal']) {
        const val = lookup['equal'].settings.example;
        const type = getOpenApiTypeForValue(val);
        return { type, const: val };
      }

      if (lookup['any']) {
        const anyPredicateSchemas:Itsa[] = lookup['any']?.settings?.schemas || [];
        if (anyPredicateSchemas.length === 1) {
          return anyPredicateSchemas[0].toOpenApiSchema({ ...params, isRoot: false });
        }else if (anyPredicateSchemas.length > 1) {
          const subSchemas = anyPredicateSchemas.map(s => s.toOpenApiSchema({ ...params, isRoot: false }));
          const type = subSchemas[0].type;
          const allSame = !subSchemas.find(ss => ss.type !== type);
          const allConst = !subSchemas.find(ss => !('const' in ss));
          const isEnum = allSame && allConst && ['string', 'number', 'integer'].includes(type);
          if (isEnum) {
            return { type };
          }else{
            return { oneOf: anyPredicateSchemas.map(s => s.toOpenApiSchema({ ...params, isRoot: false })) };
          }
        }
      }

      if (lookup['anything']) {
        return null;
      }
    })();

    if (!schema) return schema;

    // Now apply modifiers
    if (lookup['notEmpty']) schema.minLength = 1;
    if (lookup['length']) {
      const { exactly, min, max } = (lookup['length']?.settings || {});
      if (typeof min === "number") {
        schema.minLength = min;
      }
      if (typeof max === "number") {
        schema.maxLength = max;
      }
      if (typeof exactly === "number") {
        schema.minLength = exactly;
        schema.maxLength = exactly;
      }
    }

    if (lookup['between']) {
      const { min, max } = lookup['between'].settings;
      const inclusive = lookup['between'].settings.inclusive ?? true;
      if (inclusive) {
        schema.minimum = min;
        schema.maximum = max;
      }else{
        schema.exclusiveMinimum = min;
        schema.exclusiveMaximum = max;
      }
    }
    if (lookup['min']) {
      const min = lookup['min'].settings.min;
      const inclusive = lookup['min'].settings.inclusive ?? true;
      if (inclusive) {
        schema.minimum = min;
      }else{
        schema.exclusiveMinimum = min;
      }
    }
    if (lookup['max']) {
      const max = lookup['max'].settings.max;
      const inclusive = lookup['max'].settings.inclusive ?? true;
      if (inclusive) {
        schema.maximum = max;
      }else{
        schema.exclusiveMaximum = max;
      }
    }
    if (lookup['equal']) {
      schema.const = lookup['equal'].settings.example;
    }

    if (lookup['any']) {
      const anyPredicateSchemas:Itsa[] = lookup['any']?.settings?.schemas || [];
      const subSchemas = anyPredicateSchemas.map(s => s.toOpenApiSchema({ ...params, isRoot: false }));
      const type = subSchemas[0].type;
      const allSame = !subSchemas.find(ss => ss.type !== type);
      const allConst = !subSchemas.find(ss => !('const' in ss));
      const isEnum = allSame && allConst && ['string', 'number', 'integer'].includes(type);
      if (isEnum) {
        schema.enum = subSchemas.map(ss => ss.const);
      }
    }

    // Now apply meta
    for (const p of predicates) {
      if (p.id !== 'schema') continue;
      if (!p.settings) continue;
      for (const key of Object.keys(p.settings)) {
        if (key === '_defaults') continue;
        schema[key] = p.settings[key];
      }
      if (!p.settings._defaults) continue;
      for (const key of Object.keys(p.settings._defaults)) {
        if (key === '_defaults') continue;
        const hasValue = ![null, undefined].includes(schema[key]);
        if (hasValue) continue;
        schema[key] = p.settings._defaults[key];
      }
    }

    const $ref = params.toRef?.(schema);
    if ($ref && !params.isRoot) {
      return { $ref };
    }

    return schema;
  }
}

Itsa.extend(ItsaOpenApiSchema, {
  id: 'schema',
  validate: (context:ItsaValidateContext) => {
    // no impact on validation
  }
});

declare module './itsa' {
  interface Itsa extends ItsaOpenApiSchema { }
}
