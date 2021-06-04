import { Itsa } from './itsa';
declare class ItsaTouch {
    touch(this: Itsa, obj: Record<string, any>): void;
}
declare module './itsa' {
    interface Itsa extends ItsaTouch {
    }
}
export {};
//# sourceMappingURL=touch.d.ts.map