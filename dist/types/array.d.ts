import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
export declare class ItsaArray {
    array(this: Itsa, example?: ItsaOrPrimative): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaArray {
    }
}
//# sourceMappingURL=array.d.ts.map