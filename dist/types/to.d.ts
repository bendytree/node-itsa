import { Itsa } from "./itsa";
export declare class ItsaTo {
    toDate(this: Itsa): Itsa;
    toFloat(this: Itsa): Itsa;
    toInt(this: Itsa, radix?: number): Itsa;
    toLowerCase(this: Itsa): Itsa;
    toUpperCase(this: Itsa): Itsa;
    toNow(this: Itsa): Itsa;
    toString(this: Itsa): Itsa;
    toTrimmed(this: Itsa): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaTo {
    }
}
//# sourceMappingURL=to.d.ts.map