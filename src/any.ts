import _ from "lodash";
import {itsa, Itsa} from "./index";
import {ItsaActorContext, ItsaCore} from "./core";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

interface ItsaAnySettings {
  schemas: Itsa[];
}

export class ItsaAny extends ItsaCore {
  constructor() {
    super();

    this.registerActor({
      id: 'any',
      handler: (context:ItsaActorContext, settings:ItsaAnySettings) => {
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
          });
          if (subResult.ok) {
            return;
          }
        }

        result.addError(`No schemas matched.`);
      }
    });
  }
  any(...options:(ItsaOrPrimative | ItsaOrPrimative[])[]):Itsa {
    const schemas = _.flatten(options).map(x => primitiveToItsa(x));
    const settings:ItsaAnySettings = { schemas };
    this.actions.push({ actorId: 'any', settings });
    return this as any as Itsa;
  }
}


