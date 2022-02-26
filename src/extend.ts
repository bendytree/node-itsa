
import { Itsa } from "./itsa";

export class ItsaExtend {
  extend(this:Itsa, extendor:(itsa:Itsa) => void):Itsa{
    extendor(this);
    return this;
  }
}

declare module './itsa' {
  interface Itsa extends ItsaExtend { }
}

Itsa.extend(ItsaExtend);
