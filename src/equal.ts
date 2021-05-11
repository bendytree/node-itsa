
import { ItsaActorContext } from "./core";
import { Itsa } from "./index";
import {ItsaEmail} from "./email";

export interface ItsaEqualSettings {
  strict?:boolean;
  example?:any;
}

export class ItsaEqual extends ItsaEmail {
  constructor() {
    super();

    this.registerActor({
      id: 'equal',
      handler: (context:ItsaActorContext, settings:ItsaEqualSettings = {}) => {
        const { val, result } = context;
        const { example } = settings;
        const strict = settings.strict ?? true;
        const isEqual = strict ? (val === example) : (val == example);
        if (!isEqual) {
          result.addError(`Did not equal ${example}`);
        }
      }
    });
  }
  equal(val:any, settings:ItsaEqualSettings = {}):Itsa{
    settings.example = val;
    this.actions.push({ actorId: 'equal', settings });
    return this as any as Itsa;
  }
}
