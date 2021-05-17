import { Itsa } from "./itsa";
export declare class ItsaMax {
    max(this: Itsa, max: any, inclusive?: boolean): Itsa;
    under(this: Itsa, max: any, inclusive?: boolean): Itsa;
    below(this: Itsa, max: any, inclusive?: boolean): Itsa;
    atMost(this: Itsa, max: any, inclusive?: boolean): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaMax {
    }
}
//# sourceMappingURL=max.d.ts.map