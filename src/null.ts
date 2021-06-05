import {Itsa} from "./itsa";
import {ItsaEqualSettings} from "./equal";

export class ItsaNull {
  null(this:Itsa):Itsa {
    const settings:ItsaEqualSettings = { example: null, strict: true };
    this.predicates.push({ id: 'equal', settings });
    return this as any as Itsa;
  }
  undef(this:Itsa):Itsa {
    const settings:ItsaEqualSettings = { example: undefined, strict: true };
    this.predicates.push({ id: 'equal', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaNull);

declare module './itsa' {
  interface Itsa extends ItsaNull { }
}
