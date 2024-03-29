
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
    if (!val) return result.registerError('ObjectId is required', val);
    if (type !== 'string') return result.registerError('ObjectId must be a string', val);
    if (val.length !== 24) return result.registerError('ObjectId must have 24 characters', val);
    if (!rxObjectId.test(val)) return result.registerError('ObjectId may only contain 0-9, a-z', val);
  }
});

declare module './itsa' {
  interface Itsa extends ItsaObjectId { }
}
