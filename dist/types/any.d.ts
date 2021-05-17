import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
declare class ItsaAny {
    any(this: Itsa, ...options: (ItsaOrPrimative | ItsaOrPrimative[])[]): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaAny {
    }
}
export {};
//# sourceMappingURL=any.d.ts.map