
import {Itsa, ItsaValidateContext} from "./itsa";

export declare type ItsaVerifyFunction = (val:any, context:ItsaValidateContext) => boolean | string | any;

interface ItsaVerifySettings {
  verifier: ItsaVerifyFunction;
}

export class ItsaVerify {
  verify(this:Itsa, verifier:ItsaVerifyFunction):Itsa{
    const settings: ItsaVerifySettings = { verifier };
    this.predicates.push({ id: 'verify', settings });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaVerify, {
  id: 'verify',
  validate: (context:ItsaValidateContext, settings: ItsaVerifySettings) => {
    const { val, result } = context;
    const { verifier } = settings;
    try {
      const response = verifier(val, context);
      if (typeof response === 'boolean') {
        if (response === false) {
          result.registerError(`Value is invalid`, val);
        }
        return;
      }
      if (typeof response === 'string') {
        return result.registerError(response, val);
      }
    }catch(e){
      if (e === 'STOP_ON_FIRST_ERROR') throw e;
      return result.registerError(e, val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaVerify { }
}
