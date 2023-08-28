
import {itsa, Itsa} from "./itsa";

export const deepClone = function deepClone(obj) {

  function clone(val) {
    const type = typeof val;

    if (val === null || type !== "object") return val;

    if (Array.isArray(val)) return val.map(v => clone(v));
    if (val instanceof Itsa) {
      const it = new Itsa();
      it._isOptional = val._isOptional;
      it.predicates = clone(val.predicates);
      return it;
    }
    if (val instanceof Date) return new Date(val.getTime());
    if (val instanceof RegExp) return new RegExp(val);

    const clonedObj = {};
    for (const key of Object.keys(val)) {
      clonedObj[key] = clone(val[key]);
    }
    return clonedObj;
  }

  return clone(obj);
};

export class ItsaClone {
  clone(this:Itsa):Itsa{
    return deepClone(this);
  }
}

Itsa.extend(ItsaClone);

declare module './itsa' {
  interface Itsa extends ItsaClone { }
}
