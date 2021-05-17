import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
interface ItsaFunctionIncomingSettings {
    length?: ItsaOrPrimative;
}
export declare class ItsaFunction {
    function(this: Itsa, settings?: ItsaFunctionIncomingSettings): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaFunction {
    }
}
export {};
//# sourceMappingURL=function.d.ts.map