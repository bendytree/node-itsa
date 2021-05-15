
import {Itsa, ItsaValidateContext} from "./itsa";

const rxObjectId = /^[0-9a-f]{24}$/i;

export class ItsaObjectId {
  objectid(this:Itsa):Itsa{
    this.predicates.push({ id: 'objectid', settings:null });
    return this as any as Itsa;
  }
}

Itsa.extend(ItsaObjectId, {
  id: 'objectid',
  validate: (context:ItsaValidateContext, settings?:any) => {
    const { val, result, type } = context;
    if (!val) return result.addError('ObjectId is required');
    if (type !== 'string') return result.addError('ObjectId must be a string');
    if (val.length !== 24) return result.addError('ObjectId must have 24 characters');
    if (!rxObjectId.test(val)) return result.addError('ObjectId may only contain 0-9, a-z');
  }
});

declare module './itsa' {
  interface Itsa extends ItsaObjectId { }
}
