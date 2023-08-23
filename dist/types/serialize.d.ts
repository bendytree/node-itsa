import { Itsa, ItsaPredicate } from "./itsa";
export declare type RawItsa = {
    predicates: ItsaPredicate[];
};
export declare class ItsaSerialize {
    load(this: Itsa, raw: RawItsa): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaSerialize {
    }
}
//# sourceMappingURL=serialize.d.ts.map