import { Itsa, ItsaValidateContext } from "./itsa";
export declare type ItsaVerifyFunction = (val: any, context: ItsaValidateContext) => boolean | string | any;
export declare class ItsaVerify {
    verify(this: Itsa, verifier: ItsaVerifyFunction): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaVerify {
    }
}
//# sourceMappingURL=verify.d.ts.map