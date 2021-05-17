import { Itsa, ItsaInternalValidationSettings, ItsaValidationResult, ItsaValidationSettings, ItsaValidationResultBuilder } from './itsa';
declare class ItsaValidation {
    _validate(this: Itsa, settings: ItsaInternalValidationSettings): ItsaValidationResultBuilder;
    validate(this: Itsa, val: any, settings?: ItsaValidationSettings): ItsaValidationResult;
    validOrThrow(this: Itsa, val: any, settings?: ItsaValidationSettings): void;
}
declare module './itsa' {
    interface Itsa extends ItsaValidation {
    }
}
export {};
//# sourceMappingURL=validate.d.ts.map