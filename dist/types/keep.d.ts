import { Itsa } from "./itsa";
interface ItsaKeepConfig {
    partial?: boolean;
}
export declare class ItsaKeep {
    keep(this: Itsa, fields: string[], config?: ItsaKeepConfig): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaKeep {
    }
}
export {};
//# sourceMappingURL=keep.d.ts.map