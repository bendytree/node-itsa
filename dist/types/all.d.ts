import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
declare class ItsaAll {
    all(this: Itsa, ...options: (ItsaOrPrimative | ItsaOrPrimative[])[]): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaAll {
    }
}
export {};
//# sourceMappingURL=all.d.ts.map