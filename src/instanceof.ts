import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaInstanceOfSettings {
  cls: any;
}

export class ItsaInstanceOf {
  instanceof(this: Itsa, cls:any):Itsa {
    const settings:ItsaInstanceOfSettings = { cls };
    this.actions.push({ handlerId: 'instanceof', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaInstanceOf, {
  id: 'instanceof',
  handler: (context: ItsaHandlerContext, settings:ItsaInstanceOfSettings) => {
    const {val, result} = context;
    const isInstance = val instanceof settings.cls;
    if (!isInstance) {
      result.addError(`Expected instance of ${settings.cls}`);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaInstanceOf { }
}
