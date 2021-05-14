import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaMatchesSettings {
  regex:RegExp;
}

export class ItsaMatches {
  matches(this: Itsa, regex:RegExp):Itsa {
    const settings:ItsaMatchesSettings = { regex };
    this.actions.push({ handlerId: 'matches', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaMatches, {
  id: 'matches',
  handler: (context: ItsaHandlerContext, settings: ItsaMatchesSettings) => {
    const {val, result} = context;
    const valid = settings.regex.test(String(val));
    if (!valid) {
      result.addError(`Does not match ${settings.regex}`);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaMatches { }
}
