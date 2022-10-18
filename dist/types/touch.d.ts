import { Itsa } from './itsa';
declare class ItsaTouch {
    touch<X>(this: Itsa, obj: X, toucher?: (string: any, X: any) => void): X;
    keys(this: Itsa): string[];
    pick<TObj>(this: Itsa, source: TObj): Partial<TObj>;
}
declare module './itsa' {
    interface Itsa extends ItsaTouch {
    }
}
export {};
//# sourceMappingURL=touch.d.ts.map