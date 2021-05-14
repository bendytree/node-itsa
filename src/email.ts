
import { Itsa, ItsaValidateContext } from "./index";

const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ItsaEmail {
  email(this:Itsa):Itsa{
    this.predicates.push({ id: 'email', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaEmail, {
  id: 'email',
  validate: (context:ItsaValidateContext) => {
    const { val, type, result } = context;
    if (type !== 'string') return result.addError(`Expected email but found ${type}`);
    const isValid = rx.test(val);
    if (!isValid) {
      result.addError('Email address is invalid');
    }
  }
});

declare module './index' {
  interface Itsa extends ItsaEmail { }
}

