import { Itsa } from "./index";
import { ItsaActorContext } from "./core";
import {ItsaLength} from "./length";

interface ItsaMatchesSettings {
  regex:RegExp;
}

export class ItsaMatches extends ItsaLength {
  constructor() {
    super();
    this.registerActor({
      id: 'matches',
      handler: (context: ItsaActorContext, settings: ItsaMatchesSettings) => {
        const {val, result} = context;
        const valid = settings.regex.test(String(val));
        if (!valid) {
          result.addError(`Does not match ${settings.regex}`);
        }
      }
    });
  }
  matches(regex:RegExp):Itsa {
    const settings:ItsaMatchesSettings = { regex };
    this.actions.push({ actorId: 'matches', settings });
    return this as any as Itsa;
  }
}
