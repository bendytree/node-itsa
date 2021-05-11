
import {ItsaActorContext} from "./core";
import {Itsa} from "./index";
import {ItsaFalsy} from "./falsy";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

interface ItsaFunctionSettings {
  length?:Itsa;
}

interface ItsaFunctionIncomingSettings {
  length?:ItsaOrPrimative;
}

export class ItsaFunction extends ItsaFalsy {
  constructor() {
    super();

    this.registerActor({
      id: 'function',
      handler: (context:ItsaActorContext, settings:ItsaFunctionSettings) => {
        const { val, type, result } = context;
        if (type !== 'function') return result.addError('Expected function');
        if (settings.length) {
          const subResult = settings.length._validate({
            key: 'length',
            parent: null,
            val: val.length,
            exists: true,
            settings: context.validation,
          });
          result.combine(subResult);
        }
      }
    });
  }
  function(settings:ItsaFunctionIncomingSettings = {}):Itsa{
    if (settings.length) settings.length = primitiveToItsa(settings.length);
    this.actions.push({ actorId: 'function', settings });
    return this as any as Itsa;
  }
}
