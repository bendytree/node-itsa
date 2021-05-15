import {Itsa, ItsaValidateContext} from "./itsa";

export class ItsaAnything {
  anything(this:Itsa):Itsa {
    this.predicates.push({ id: 'anything', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaAnything, {
  id: 'anything',
  validate: (context:ItsaValidateContext) => {

  }
});

declare module './itsa' {
  interface Itsa extends ItsaAnything { }
}
