
import {
  Itsa, ItsaError,
  ItsaValidator,
  ItsaValidateContext,
  ItsaInternalValidationSettings, ItsaValidationException,
  ItsaValidationResult,
  ItsaValidationSettings
} from './index';

class ItsaValidation {
  _validate(this:Itsa, settings:ItsaInternalValidationSettings):ItsaValidationResult {
    const { key } = settings;
    const result = new ItsaValidationResult(settings.settings.exhaustive, key, settings.path);
    result.value = settings.val;
    try {
      const setVal = (newVal:any) => {
        if (settings.parent) {
          settings.parent[settings.key] = newVal;
          settings.val = newVal;
        }else{
          result.value = newVal;
        }
      };
      for (const predicate of this.predicates) {
        const validator:ItsaValidator = Itsa.validators[predicate.id];

        /* istanbul ignore next */
        if (!validator) throw new Error(`Validator not found: ${predicate.id}`);

        const context:ItsaValidateContext = {
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
        if (!result.ok) return result;
      }
    }catch (e){
      /* istanbul ignore next */
      if (e !== 'STOP_ON_FIRST_ERROR') throw e;
    }
    return result;
  }

  validate(this:Itsa, val: any, settings:ItsaValidationSettings = {}):ItsaValidationResult {
    return this._validate({
      val,
      settings,
      key:null,
      parent:null,
      exists: true,
      path: [],
    });
  }

  validateOrThrow(this:Itsa, val:any, settings?:ItsaValidationSettings) {
    const result = this.validate(val, settings);
    if (!result.ok) {
      const error = new ItsaValidationException(`${result.errors[0].path.join('.')}: ${result.errors[0].message}`);
      error.result = result;
      throw error;
    }
  }
}

Itsa.extend(ItsaValidation);

declare module './index' {
  interface Itsa extends ItsaValidation { }
}
