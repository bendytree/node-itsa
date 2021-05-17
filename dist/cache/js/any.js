"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itsa_1 = require("./itsa");
const helpers_1 = require("./helpers");
class ItsaAny {
    any(...options) {
        const schemas = options.flat().map(x => helpers_1.primitiveToItsa(x));
        const settings = { schemas };
        this.predicates.push({ id: 'any', settings });
        return this;
    }
}
const validate = {
    id: 'any',
    validate: (context, settings) => {
        const { key, val, parent, validation, exists, result } = context;
        const { schemas } = settings;
        if (schemas.length === 0)
            return;
        for (const subSchema of schemas) {
            const subResult = subSchema._validate({
                key,
                parent,
                val,
                exists,
                settings: validation,
                path: context.path,
            });
            if (subResult.ok) {
                return;
            }
        }
        result.addError(`No schemas matched.`);
    }
};
itsa_1.Itsa.extend(ItsaAny, validate);
//# sourceMappingURL=any.js.map