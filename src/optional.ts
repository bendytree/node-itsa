
import { Itsa, ItsaOrPrimative, ItsaValidateContext } from "./itsa";
import { primitiveToItsa} from "./helpers";

interface ItsaOptionalSettings {
  allowedSchema:Itsa;
}

export class ItsaOptional {
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

    const subResult = settings.allowedSchema._validate({
      key,
      parent,
      val,
      exists,
      path,
      settings: validation,
    });
    if (!subResult.ok) {
      return result.registerError(subResult.message, val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaOptional { }
}
