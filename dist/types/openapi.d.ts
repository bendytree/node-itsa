import { Itsa } from './itsa';
export interface ItsaSchemaSettings {
    description?: string;
    example?: any;
    default?: any;
    title?: any;
    _defaults?: Omit<ItsaSchemaSettings, '_defaults'>;
}
export interface IToOpenApiSchemaParams {
    toRef?(schema: any): string | null | undefined;
    isRoot?: boolean;
}
declare class ItsaOpenApiSchema {
    schema(this: Itsa, settings: ItsaSchemaSettings): Itsa;
    toOpenApiSchema<X>(this: Itsa, params?: IToOpenApiSchemaParams): any;
}
declare module './itsa' {
    interface Itsa extends ItsaOpenApiSchema {
    }
}
export {};
//# sourceMappingURL=openapi.d.ts.map