import { Itsa } from "./itsa";
export declare class ItsaExtend {
    extend(this: Itsa, extendor: (itsa: Itsa) => void): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaExtend {
    }
}
//# sourceMappingURL=extend.d.ts.map