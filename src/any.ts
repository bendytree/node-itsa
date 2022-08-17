import {ItsaValidateContext, Itsa, ItsaValidator} from "./itsa";
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

    const truthyErrors = [];
    for (const subSchema of schemas) {
      const isSchemaTruthy = subSchema.predicates.find(p => !['equal', 'falsy'].includes(p.id));

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
      }else if (isSchemaTruthy) {
        truthyErrors.push(subResult.message);
      }
    }

    if (truthyErrors.length === 1) {
      result.registerError(truthyErrors[0], val);
    }else{
      result.registerError(`No schemas matched.`, val);
    }
  }
};

Itsa.extend(ItsaAny, validate);

declare module './itsa' {
  interface Itsa extends ItsaAny { }
}
