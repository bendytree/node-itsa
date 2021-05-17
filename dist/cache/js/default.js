"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItsaDefault = void 0;
const itsa_1 = require("./itsa");
class ItsaDefault {
    default(val, settings = {}) {
        settings.val = val;
        this.predicates.push({ id: 'default', settings });
        return this;
    }
    defaultNow() {
        this.predicates.push({ id: 'defaultNow', settings: null });
        return this;
    }
}
exports.ItsaDefault = ItsaDefault;
itsa_1.Itsa.extend(ItsaDefault, ...[
    {
        id: 'default',
        validate: (context, settings) => {
            const { val, setVal } = context;
            const falsy = settings.falsy ?? false;
            const doReplace = falsy ? !val : (val === null || val === undefined);
            if (doReplace) {
                setVal(settings.val);
            }
        }
    },
    {
        id: 'defaultNow',
        validate: (context) => {
            const { val, setVal } = context;
            if (val === null || val === undefined) {
                setVal(new Date());
            }
        }
    }
]);
//# sourceMappingURL=default.js.map