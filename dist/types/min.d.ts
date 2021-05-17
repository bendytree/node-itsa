import { Itsa } from "./itsa";
export declare class ItsaMin {
    min(this: Itsa, min: any, inclusive?: boolean): Itsa;
    over(this: Itsa, min: any, inclusive?: boolean): Itsa;
    above(this: Itsa, min: any, inclusive?: boolean): Itsa;
    atLeast(this: Itsa, min: any, inclusive?: boolean): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaMin {
    }
}
//# sourceMappingURL=min.d.ts.map