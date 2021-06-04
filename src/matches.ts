import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaMatchesSettings {
  regex:RegExp;
}

export class ItsaMatches {
  matches(this: Itsa, regex:RegExp):Itsa {
    const settings:ItsaMatchesSettings = { regex };
    this.predicates.push({ id: 'matches', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaMatches, {
  id: 'matches',
  validate: (context: ItsaValidateContext, settings: ItsaMatchesSettings) => {
    const {val, result} = context;
    const valid = settings.regex.test(String(val));
    if (!valid) {
      result.registerError(`Does not match ${settings.regex}`);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaMatches { }
}
