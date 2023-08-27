
import { Itsa } from "./itsa";

export class ItsaOptional {
  isRequired(this: Itsa): boolean {
    return !this._isOptional;
  }
  optional(this:Itsa, schema?: Itsa):Itsa{
    this._isOptional = true;

    if (schema) {
      for (const p of schema.predicates) {
        this.predicates.push(p);
      }
    }

    return this;
  }
}

Itsa.extend(ItsaOptional);

declare module './itsa' {
  interface Itsa extends ItsaOptional { }
}
