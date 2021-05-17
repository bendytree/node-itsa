"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itsa_1 = require("./itsa");
class ItsaValidation {
    _validate(settings) {
        const { key } = settings;
        const result = new itsa_1.ItsaValidationResultBuilder(settings.settings.exhaustive, key, settings.path);
        result.value = settings.val;
        try {
            const setVal = (newVal) => {
                if (settings.parent) {
                    settings.parent[settings.key] = newVal;
                    settings.val = newVal;
                }
                else {
                    result.value = newVal;
                }
            };
            for (const predicate of this.predicates) {
                const validator = itsa_1.Itsa.validators[predicate.id];
                /* istanbul ignore next */
                if (!validator)
                    throw new Error(`Validator not found: ${predicate.id}`);
                const context = {
                    setVal,
                    result,
                    val: settings.val,
                    key: settings.key,
                    parent: settings.parent,
                    exists: settings.exists,
                    type: typeof settings.val,
                    validation: settings.settings,
                    path: settings.path,
                };
                validator.validate(context, predicate.settings);
                if (!result.ok)
                    return result;
            }
        }
        catch (e) {
            /* istanbul ignore next */
            if (e !== 'STOP_ON_FIRST_ERROR')
                throw e;
        }
        return result;
    }
    validate(val, settings = {}) {
        return this._validate({
            val,
            settings,
            key: null,
            parent: null,
            exists: true,
            path: [],
        });
    }
    validOrThrow(val, settings) {
        const result = this.validate(val, settings);
        if (!result.ok) {
            throw new itsa_1.ItsaValidationException(result);
        }
    }
}
itsa_1.Itsa.extend(ItsaValidation);
//# sourceMappingURL=validate.js.map