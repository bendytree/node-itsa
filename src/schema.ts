import {Itsa} from "./itsa";

export class ItsaSchema {
  schema(this:Itsa, schema:Itsa):Itsa {
    for (const p of schema.predicates) {
      this.predicates.push(p);
    }
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaSchema);

declare module './itsa' {
  interface Itsa extends ItsaSchema { }
}
