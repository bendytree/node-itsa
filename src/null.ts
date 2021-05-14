import {Itsa} from "./index";
import {ItsaEqualSettings} from "./equal";

export class ItsaNull {
  null(this:Itsa):Itsa {
    const settings:ItsaEqualSettings = { example: null, strict: true };
    this.predicates.push({ id: 'equal', settings });
    return this as any as Itsa;
  }
  undefined(this:Itsa):Itsa {
    const settings:ItsaEqualSettings = { example: undefined, strict: true };
    this.predicates.push({ id: 'equal', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaNull);

declare module './index' {
  interface Itsa extends ItsaNull { }
}
