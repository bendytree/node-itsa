import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
export declare class ItsaAnd {
    and(this: Itsa, ...options: (ItsaOrPrimative | ItsaOrPrimative[])[]): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaAnd {
    }
}
//# sourceMappingURL=and.d.ts.map