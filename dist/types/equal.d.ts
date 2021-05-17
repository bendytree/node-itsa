import { Itsa } from "./itsa";
export interface ItsaEqualSettings {
    strict?: boolean;
    example?: any;
}
export declare class ItsaEqual {
    equal(this: Itsa, val: any, settings?: ItsaEqualSettings): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaEqual {
    }
}
//# sourceMappingURL=equal.d.ts.map