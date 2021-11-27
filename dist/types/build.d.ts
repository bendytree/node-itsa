import { Itsa } from './itsa';
declare class ItsaBuild {
    build<X>(this: Itsa, overrides?: X): any;
}
declare module './itsa' {
    interface Itsa extends ItsaBuild {
    }
}
export {};
//# sourceMappingURL=build.d.ts.map