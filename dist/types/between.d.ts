import { Itsa } from "./itsa";
export interface ItsaBetweenExtraSettings {
    inclusive?: boolean;
}
export interface ItsaBetweenSettings extends ItsaBetweenExtraSettings {
    min: any;
    max: any;
    inclusive?: boolean;
}
export declare class ItsaBetween {
    between(this: Itsa, min: any, max: any, extraSettings?: ItsaBetweenExtraSettings): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaBetween {
    }
}
//# sourceMappingURL=between.d.ts.map