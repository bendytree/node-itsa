import {Itsa} from "./index";
import {ItsaNotEmpty} from "./not-empty";
import { ItsaEqualSettings } from './equal';

export class ItsaNull extends ItsaNotEmpty {
  constructor() {
    super();
  }
  null():Itsa {
    const settings:ItsaEqualSettings = { example: null, strict: true };
    this.actions.push({ actorId: 'equal', settings });
    return this as any as Itsa;
  }
  undefined():Itsa {
    const settings:ItsaEqualSettings = { example: undefined, strict: true };
    this.actions.push({ actorId: 'equal', settings });
    return this as any as Itsa;
  }
}


