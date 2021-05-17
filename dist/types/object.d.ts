import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
interface ItsaObjectExampleWithPrimitives {
    [key: string]: ItsaOrPrimative;
}
interface ItsaObjectConfig {
    extras?: boolean;
    key?: Itsa;
    value?: Itsa;
}
export declare class ItsaObject {
    object(this: Itsa, example?: ItsaObjectExampleWithPrimitives, config?: ItsaObjectConfig): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaObject {
    }
}
export {};
//# sourceMappingURL=object.d.ts.map