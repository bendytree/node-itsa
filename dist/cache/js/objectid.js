"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaObjectId = void 0;
const itsa_1 = require("./itsa");
const rxObjectId = /^[0-9a-f]{24}$/i;
class ItsaObjectId {
    objectid() {
        this.predicates.push({ id: 'objectid', settings: null });
        return this;
    }
}
exports.ItsaObjectId = ItsaObjectId;
itsa_1.Itsa.extend(ItsaObjectId, {
    id: 'objectid',
    validate: (context, settings) => {
        const { val, result, type } = context;
        if (!val)
            return result.addError('ObjectId is required');
        if (type !== 'string')
            return result.addError('ObjectId must be a string');
        if (val.length !== 24)
            return result.addError('ObjectId must have 24 characters');
        if (!rxObjectId.test(val))
            return result.addError('ObjectId may only contain 0-9, a-z');
    }
});
//# sourceMappingURL=objectid.js.map