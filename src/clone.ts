
import {itsa, Itsa} from "./itsa";

export class ItsaClone {
  clone(this:Itsa):Itsa{
    const raw = JSON.parse(JSON.stringify(this));
    return itsa.load(raw);
  }
}

Itsa.extend(ItsaClone);

declare module './itsa' {
  interface Itsa extends ItsaClone { }
}
