import {ItsaValidateContext, Itsa, ItsaValidator} from "./index";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

interface ItsaAnySettings {
  schemas: Itsa[];
}

class ItsaAny {
  any (this:Itsa, ...options:(ItsaOrPrimative | ItsaOrPrimative[])[]):Itsa {
    const schemas = options.flat().map(x => primitiveToItsa(x)) as Itsa[];
    const settings:ItsaAnySettings = { schemas };
    this.predicates.push({ id: 'any', settings });
    return this as any as Itsa;
  }
}

const validate:ItsaValidator = {
  id: 'any',
  validate: (context:ItsaValidateContext, settings:ItsaAnySettings) => {
    const { key, val, parent, validation, exists, result } = context;
    const { schemas } = settings;

    if (schemas.length === 0)
      return;

    for (const subSchema of schemas) {
      const subResult = subSchema._validate({
        key,
        parent,
        val,
        exists,
        settings: validation,
        path: context.path,
      });
      if (subResult.ok) {
        return;
      }
    }

    result.addError(`No schemas matched.`);
  }
};

Itsa.extend(ItsaAny, validate);

declare module './index' {
  interface Itsa extends ItsaAny { }
}
