
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import {ItsaDefault} from "./default";

const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ItsaEmail extends ItsaDefault {
  constructor() {
    super();

    this.registerActor({
      id: 'email',
      handler: (context:ItsaActorContext) => {
        const { val, type, result } = context;
        if (type !== 'string') return result.addError(`Expected email but found ${type}`);
        const isValid = rx.test(val);
        if (!isValid) {
          result.addError('Email address is invalid');
        }
      }
    });
  }
  email():Itsa{
    this.actions.push({ actorId: 'email', settings:null });
    return this as any as Itsa;
  }
}
