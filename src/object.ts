
import {Itsa, ItsaValidateContext} from "./itsa";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

interface ItsaObjectExample {
  [key: string]:Itsa;
}

interface ItsaObjectExampleWithPrimitives {
  [key: string]:ItsaOrPrimative;
}

interface ItsaObjectConfig {
  extras?: boolean;
  key?: Itsa;
  value?: Itsa;
  partial?: boolean;
}

export interface ItsaObjectSettings {
  example?: ItsaObjectExample;
  config: ItsaObjectConfig;
}

export class ItsaObject {
  object(this:Itsa, example?:ItsaObjectExampleWithPrimitives, config:ItsaObjectConfig = {}):Itsa{
    let convertedExample = null;
    if (example) {
      convertedExample = {};
      for (const key in example) {
        convertedExample[key] = primitiveToItsa(example[key]);
      }
    }
    if (config.key) {
      config.key = primitiveToItsa(config.key);
    }
    if (config.value) {
      config.value = primitiveToItsa(config.value);
    }
    const settings:ItsaObjectSettings = { example:convertedExample as ItsaObjectExample, config };
    this.predicates.push({ id: 'object', settings });
    return this as any as Itsa;
  }
  addProperty(this:Itsa, key:string, schema:ItsaOrPrimative):Itsa {
    for (let i = this.predicates.length - 1; i >= 0; i--) {
      const pred = this.predicates[i];
      if (pred.id !== 'object') continue;
      if (!pred.settings) pred.settings = {};
      if (!pred.settings.example) pred.settings.example = {};
      if (!pred.settings.config) pred.settings.config = {};
      pred.settings.example[key] = primitiveToItsa(schema);
      break;
    }
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaObject, {
  id: 'object',
  builder(settings: ItsaObjectSettings) {
    const obj = {};
    const example = settings.example as any;
    if (example) {
      const keys = Object.keys(example);
      for (const key of keys) {
        const schemaForKey = example[key];
        obj[key] = schemaForKey.build();
      }
    }
    return obj;
  },
  validate: (context:ItsaValidateContext, settings:ItsaObjectSettings) => {
    const { val, parent, validation, result, type } = context;
    const { example, config } = settings;
    const extras = config.extras ?? false;

    // Validate object
    if (!val) return result.registerError(`Expected object but value is ${val}.`, val);
    if (type !== "object") return result.registerError(`Expected object but type is ${type}.`, val);
    if (val instanceof RegExp) return result.registerError(`Expected object but type is regex.`, val);
    if (val instanceof Date) return result.registerError(`Expected object but type is date.`, val);
    if (Array.isArray(val)) return result.registerError(`Expected object but type is array.`, val);

    const objectKeys = Object.keys(val);

    if (example) {
      // Validate according to example
      const exampleKeys = Object.keys(example);
      for (const key of exampleKeys) {
        // For root object, we might skip missing fields
        const v = val[key];
        const isMissing = v === undefined;
        const isPartial = validation.partial || config.partial;
        if (isPartial && isMissing) {
          continue;
        }

        const subSchema = example[key];
        const subResult = subSchema._validate({
          key,
          parent:val,
          val: val[key],
          exists: key in val,
          settings: validation,
          path: [...context.path, key],
        });
        result.registerResult(subResult);
      }

      // Error for extra properties?
      if (!extras) {
        const extraKeys = objectKeys.filter(k => !exampleKeys.includes(k));
        if (extraKeys.length) {
          result.registerError(`Extra unknown properties: ${extraKeys.join(', ')}`, val);
        }
      }
    }

    if (config.key) {
      for (const key of objectKeys) {
        const subResult = config.key._validate({
          key,
          parent: val,
          val: key,
          exists: true,
          settings: validation,
          path: [...context.path, key],
        });
        result.registerResult(subResult);
      }
    }

    if (config.value) {
      for (const key of objectKeys) {
        const subVal = val[key];
        const subResult = config.value._validate({
          key,
          parent: val,
          val: subVal,
          exists: true,
          settings: validation,
          path: [...context.path, key],
        });
        result.registerResult(subResult);
      }
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaObject { }
}
