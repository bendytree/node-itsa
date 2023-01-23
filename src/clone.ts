
import {itsa, Itsa} from "./itsa";
import { deepClone } from './clone-rfdc';

export class ItsaClone {
  clone(this:Itsa):Itsa{
    const raw = deepClone(this);
    return itsa.load(raw);
  }
}

Itsa.extend(ItsaClone);

declare module './itsa' {
  interface Itsa extends ItsaClone { }
}
