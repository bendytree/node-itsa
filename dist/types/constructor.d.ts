import { Itsa } from "./itsa";
export interface ItsaConstructorSettings {
    cls: Function;
}
export declare class ItsaConstructor {
    constructorIs(this: Itsa, cls: Function): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaConstructor {
    }
}
//# sourceMappingURL=constructor.d.ts.map