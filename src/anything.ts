import {Itsa, ItsaHandlerContext} from "./index";

export class ItsaAnything {
  anything(this:Itsa):Itsa {
    this.actions.push({ handlerId: 'anything', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaAnything, {
  id: 'anything',
  handler: (context:ItsaHandlerContext) => {

  }
});

declare module './index' {
  interface Itsa extends ItsaAnything { }
}
