
import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaVerifySettings {
  verifier: Function;
}

export class ItsaVerify {
  verify(this:Itsa, verifier:Function):Itsa{
    const settings: ItsaVerifySettings = { verifier };
    this.actions.push({ handlerId: 'verify', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaVerify, {
  id: 'verify',
  handler: (context:ItsaHandlerContext, settings: ItsaVerifySettings) => {
    const { val, result } = context;
    const { verifier } = settings;
    try {
      const response = verifier(val);
      if (typeof response === 'boolean') {
        if (response === false) {
          result.addError(`Value is invalid`);
        }
        return;
      }
      if (typeof response === 'string') {
        return result.addError(response);
      }
    }catch(e){
      if (e === 'STOP_ON_FIRST_ERROR') throw e;
      return result.addError(e);
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaVerify { }
}
