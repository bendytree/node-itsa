import { Itsa } from "./itsa";
export interface ItsaConvertSettings {
    converter: Function;
}
export declare class ItsaConvert {
    convert(this: Itsa, converter: Function): Itsa;
    to(this: Itsa, converter: Function): Itsa;
}
declare module './itsa' {
    interface Itsa extends ItsaConvert {
    }
}
//# sourceMappingURL=convert.d.ts.map