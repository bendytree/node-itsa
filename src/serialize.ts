
import {Itsa, ItsaPredicate} from "./index";

type RawItsa = {predicates:ItsaPredicate[]};

const convert = (el:any) => {
  const proto = Object.prototype.toString.call(el);
  const isObject = `[object Object]` === proto;
  const isArray = `[object Array]` === proto;
  if (!isObject && !isArray) {
    return el;
  }

  // replace sub-schemas: depth first
  for (const key in el) {
    el[key] = convert(el[key]);
  }

  if (isObject && el.predicates) {
    const i = new Itsa();
    i.predicates = el.predicates;
    return i;
  }

  return el;
}

export class ItsaSerialize {
  load(this:Itsa, raw:RawItsa):Itsa{
    this.predicates = convert(raw).predicates;
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaSerialize);

declare module './index' {
  interface Itsa extends ItsaSerialize { }
}
