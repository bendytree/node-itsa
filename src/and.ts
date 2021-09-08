import {Itsa} from "./itsa";
import {ItsaOrPrimative, primitiveToItsa} from "./helpers";

export class ItsaAnd {
  and (this:Itsa, ...options:(ItsaOrPrimative | ItsaOrPrimative[])[]):Itsa {
    const schemas = options.flat().map(x => primitiveToItsa(x)) as Itsa[];
    for (const schema of schemas) {
      for (const p of schema.predicates) {
        this.predicates.push(p);
      }
    }
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaAnd);

declare module './itsa' {
  interface Itsa extends ItsaAnd { }
}
