
import { Itsa, ItsaValidateContext } from "./itsa";

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
    if (type !== 'string') return result.registerError(`Expected email but found ${type}`, val);
    const isValid = rx.test(val);
    if (!isValid) {
      result.registerError('Email address is invalid', val);
    }
  }
});

declare module './itsa' {
  interface Itsa extends ItsaEmail { }
}

