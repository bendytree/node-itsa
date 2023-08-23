import { Itsa } from './itsa';
declare class ItsaOpenApiSchema {
    toOpenApiSchema<X>(this: Itsa): any;
}
declare module './itsa' {
    interface Itsa extends ItsaOpenApiSchema {
    }
}
export {};
//# sourceMappingURL=openapi.d.ts.map