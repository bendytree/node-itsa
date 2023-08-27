import { Itsa, ItsaPredicate } from "./itsa";
export declare type RawItsa = {
    _isOptional: boolean;
    predicates: ItsaPredicate[];
};
export declare class ItsaSerialize {
    load(this: Itsa, raw: RawItsa): Itsa;
    toJSON(this: Itsa): RawItsa;
    toRaw(this: Itsa): RawItsa;
}
declare module './itsa' {
    interface Itsa extends ItsaSerialize {
    }
}
//# sourceMappingURL=serialize.d.ts.map