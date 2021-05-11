
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import {ItsaUnique} from "./unique";

interface ItsaVerifySettings {
  verifier: Function;
}

export class ItsaVerify extends ItsaUnique {
  constructor() {
    super();

    this.registerActor({
      id: 'verify',
      handler: (context:ItsaActorContext, settings: ItsaVerifySettings) => {
        const { val, result } = context;
        const { verifier } = settings;
        try {
          const response = verifier(val);
          if (typeof response === 'boolean') {
            if (response === false) {
              result.addError(`Value is invalid`);
            }
            return;
          }
          if (typeof response === 'string') {
            return result.addError(response);
          }
        }catch(e){
          if (e === 'STOP_ON_FIRST_ERROR') throw e;
          return result.addError(e);
        }
      }
    });
  }
  verify(verifier:Function):Itsa{
    const settings: ItsaVerifySettings = { verifier };
    this.actions.push({ actorId: 'verify', settings });
    return this as any as Itsa;
  }
}
