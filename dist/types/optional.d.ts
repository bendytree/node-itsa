import { Itsa } from "./itsa";
export declare class ItsaOptional {
    isRequired(this: Itsa): boolean;
    optional(this: Itsa, schema?: Itsa): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaOptional {
    }
}
//# sourceMappingURL=optional.d.ts.map