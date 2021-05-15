
import {Itsa, ItsaValidateContext} from "./itsa";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

interface ItsaFunctionSettings {
  length?:Itsa;
}

interface ItsaFunctionIncomingSettings {
  length?:ItsaOrPrimative;
}

export class ItsaFunction {
  function(this:Itsa, settings:ItsaFunctionIncomingSettings = {}):Itsa{
    if (settings.length) settings.length = primitiveToItsa(settings.length);
    this.predicates.push({ id: 'function', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaFunction, {
  id: 'function',
  validate: (context:ItsaValidateContext, settings:ItsaFunctionSettings) => {
    const { val, type, result } = context;
    if (type !== 'function') return result.addError('Expected function');
    if (settings.length) {
      const subResult = settings.length._validate({
        key: 'length',
        parent: null,
        val: val.length,
        exists: true,
        settings: context.validation,
        path: context.path,
      });
      result.combine(subResult);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaFunction { }
}

