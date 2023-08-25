import { Itsa } from './itsa';
export interface ItsaSchemaSettings {
    description?: string;
    example?: any;
    default?: any;
    title?: any;
}
declare class ItsaOpenApiSchema {
    schema(this: Itsa, settings: ItsaSchemaSettings): Itsa;
    toOpenApiSchema<X>(this: Itsa): any;
}
declare module './itsa' {
    interface Itsa extends ItsaOpenApiSchema {
    }
}
export {};
//# sourceMappingURL=openapi.d.ts.map