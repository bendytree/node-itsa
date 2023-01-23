import { Itsa } from "./itsa";
import { ItsaOrPrimative } from "./helpers";
interface ItsaObjectExample {
    [key: string]: Itsa;
}
interface ItsaObjectExampleWithPrimitives {
    [key: string]: ItsaOrPrimative;
}
interface ItsaObjectConfig {
    extras?: boolean;
    key?: Itsa;
    value?: Itsa;
    partial?: boolean;
}
export interface ItsaObjectSettings {
    example?: ItsaObjectExample;
    config: ItsaObjectConfig;
}
export declare class ItsaObject {
    object(this: Itsa, example?: ItsaObjectExampleWithPrimitives, config?: ItsaObjectConfig): Itsa;
    addProperty(this: Itsa, key: string, schema: ItsaOrPrimative): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaObject {
    }
}
export {};
//# sourceMappingURL=object.d.ts.map