
import {itsa, Itsa} from "./itsa";

export declare type ItsaOrPrimative = Itsa | number | string | boolean | null | undefined | Function;

export function primitiveToItsa (val:ItsaOrPrimative):Itsa {
  if (val instanceof Itsa) {
    return val;
  }else if (typeof val === 'function') {
    return itsa.constructorIs(val);
  }else {
    return itsa.equal(val);
  }
}
