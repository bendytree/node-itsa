import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import { ItsaInstanceOf } from "./instanceof";

export class ItsaInteger extends ItsaInstanceOf {
  constructor() {
    super();

    this.registerActor({
      id: 'integer',
      handler: (context: ItsaActorContext) => {
        const {val, result} = context;
        const valid = typeof val === "number"
          && isNaN(val) === false
          && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
          && val % 1 === 0;
        if (!valid) {
          result.addError('Invalid integer');
        }
      }
    });
  }
  integer():Itsa {
    this.actions.push({ actorId: 'integer', settings:null });
    return this as any as Itsa;
  }
}
