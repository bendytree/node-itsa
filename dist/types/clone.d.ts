import { Itsa } from "./itsa";
export declare const deepClone: (obj: any) => any;
export declare class ItsaClone {
    clone(this: Itsa): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaClone {
    }
}
//# sourceMappingURL=clone.d.ts.map