import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaInstanceOfSettings {
  cls: any;
}

export class ItsaInstanceOf {
  instanceof(this: Itsa, cls:any):Itsa {
    const settings:ItsaInstanceOfSettings = { cls };
    this.predicates.push({ id: 'instanceof', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaInstanceOf, {
  id: 'instanceof',
  validate: (context: ItsaValidateContext, settings:ItsaInstanceOfSettings) => {
    const {val, result} = context;
    const isInstance = val instanceof settings.cls;
    if (!isInstance) {
      result.registerError(`Expected instance of ${settings.cls}`, val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaInstanceOf { }
}
