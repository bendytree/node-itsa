"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaFunction = void 0;
const itsa_1 = require("./itsa");
const helpers_1 = require("./helpers");
class ItsaFunction {
    function(settings = {}) {
        if (settings.length)
            settings.length = helpers_1.primitiveToItsa(settings.length);
        this.predicates.push({ id: 'function', settings });
        return this;
    }
}
exports.ItsaFunction = ItsaFunction;
itsa_1.Itsa.extend(ItsaFunction, {
    id: 'function',
    validate: (context, settings) => {
        const { val, type, result } = context;
        if (type !== 'function')
            return result.addError('Expected function');
        if (settings.length) {
            const subResult = settings.length._validate({
                key: 'length',
                parent: null,
                val: val.length,
                exists: true,
                settings: context.validation,
                path: context.path,
            });
            result.combine(subResult);
        }
    }
});
//# sourceMappingURL=function.js.map