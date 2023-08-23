
import { Itsa, ItsaOrPrimative, ItsaValidateContext } from "./itsa";
import { primitiveToItsa} from "./helpers";

interface ItsaOptionalSettings {
  allowedSchema:Itsa;
}

export class ItsaOptional {
  isRequired(this: Itsa): boolean {
    return !this.predicates.find(p => p.id === 'optional');
  }
  optional(this:Itsa, allowedSchema:ItsaOrPrimative):Itsa{
    const settings:ItsaOptionalSettings = { allowedSchema: primitiveToItsa(allowedSchema) };
    this.predicates.push({ id: 'optional', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaOptional, {
  id: 'optional',
  validate: (context:ItsaValidateContext, settings:ItsaOptionalSettings) => {
    const { key, parent, exists, validation, path, val, result } = context;
    if (val === null) return;
    if (val === undefined) return;

    const allowedTypes = [];
    for (const p of settings.allowedSchema.predicates) {
      if (p.id === 'string') allowedTypes.push('string');
      if (p.id === 'number') allowedTypes.push('number');
      if (p.id === 'integer') allowedTypes.push('number');
    }
    if (!val && allowedTypes.includes(typeof val)) {
      return;
    }

    const subResult = settings.allowedSchema._validate({
      key,
      parent,
      val,
      exists,
      path,
      settings: validation,
    });
    if (!subResult.ok) {
      return result.addResult(subResult);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaOptional { }
}
