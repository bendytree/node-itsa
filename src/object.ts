
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
}

interface ItsaObjectSettings {
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
}

Itsa.extend(ItsaObject, {
  id: 'object',
  validate: (context:ItsaValidateContext, settings:ItsaObjectSettings) => {
    const { val, parent, validation, result, type } = context;
    const { example, config } = settings;
    const extras = config.extras ?? false;

    // Validate object
    if (!val) return result.addError(`Expected object but value is ${val}.`);
    if (type !== "object") return result.addError(`Expected object but type is ${type}.`);
    if (val instanceof RegExp) return result.addError(`Expected object but type is regex.`);
    if (val instanceof Date) return result.addError(`Expected object but type is date.`);
    if (Array.isArray(val)) return result.addError(`Expected object but type is array.`);

    const objectKeys = Object.keys(val);

    if (example) {
      // Validate according to example
      const exampleKeys = Object.keys(example);
      for (const key of exampleKeys) {
        // For root object, we might skip missing fields
        if (!parent && validation.partial && !objectKeys.includes(key)) {
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
        result.combine(subResult);
      }

      // Error for extra properties?
      if (!extras) {
        const extraKeys = objectKeys.filter(k => !exampleKeys.includes(k));
        if (extraKeys.length) {
          result.addError(`Extra unknown properties: ${extraKeys.join(', ')}`);
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
        result.combine(subResult);
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
        result.combine(subResult);
      }
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaObject { }
}
