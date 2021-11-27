import { Itsa, ItsaOrPrimative } from "./itsa";
export declare class ItsaOptional {
    optional(this: Itsa, allowedSchema: ItsaOrPrimative): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaOptional {
    }
}
//# sourceMappingURL=optional.d.ts.map