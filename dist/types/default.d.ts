import { Itsa } from "./itsa";
export interface ItsaDefaultSettings {
    val?: any;
    falsy?: boolean;
}
export declare class ItsaDefault {
    default(this: Itsa, val: any, settings?: ItsaDefaultSettings): Itsa;
    defaultNow(this: Itsa): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaDefault {
    }
}
//# sourceMappingURL=default.d.ts.map