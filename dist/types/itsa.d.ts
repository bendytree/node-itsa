import './default';
export interface ItsaInternalValidationSettings {
    val: any;
    key?: string | number;
    path: (string | number)[];
    parent?: object | [];
    exists: boolean;
    settings: ItsaValidationSettings;
}
export interface ItsaValidationSettings {
    partial?: boolean;
    exhaustive?: boolean;
    hint?: string;
}
export interface ItsaError {
    message: string;
    key: string | number;
    path: (string | number)[];
}
export declare class ItsaValidationException extends Error {
    message: string;
    result: ItsaValidationResult;
    constructor(result: ItsaValidationResult);
}
export declare class ItsaValidationResult {
    ok: boolean;
    errors: ItsaError[];
    value: any;
    message?: string;
    okOrThrow(): void;
    addError(error: ItsaError): void;
    addResult(result: ItsaValidationResult): void;
}
export declare class ItsaValidationResultBuilder extends ItsaValidationResult {
    ok: boolean;
    errors: any[];
    value: any;
    hint?: any;
    message?: any;
    private readonly exhaustive;
    private readonly key;
    private readonly path;
    private messageFormat?;
    constructor(exhaustive: boolean, key: string | number, path: (string | number)[], hint?: string);
    registerError(message: string, val: any): void;
    registerResult(result: ItsaValidationResult): void;
    withMessageFormat(messageFormat?: string): this;
}
export interface ItsaValidateContext {
    parent?: object | [];
    key?: string | number;
    path: (string | number)[];
    exists: boolean;
    val: any;
    type: string;
    setVal: (val: any) => void;
    validation: ItsaValidationSettings;
    result: ItsaValidationResultBuilder;
}
export interface ItsaPredicate {
    id: string;
    settings?: any;
}
export interface ItsaValidator {
    id: string;
    validate: (ItsaValidateContext: any, any: any) => void;
    builder?: (settings: any) => any;
}
declare type ItsaSubclass = new (...args: any[]) => any;
export declare class Itsa {
    predicates: ItsaPredicate[];
    static validators: {
        [key: string]: ItsaValidator;
    };
    static extend(cls: ItsaSubclass, ...validators: ItsaValidator[]): void;
}
export declare const itsa: Itsa;
export type { ItsaOrPrimative, primitiveToItsa } from './helpers';
import './all';
import './and';
import './any';
import './anything';
import './array';
import './between';
import './boolean';
import './build';
import './clone';
import './constructor';
import './convert';
import './date';
import './default';
import './email';
import './equal';
import './extend';
import './falsy';
import './function';
import './instanceof';
import './integer';
import './keep';
import './length';
import './matches';
import './max';
import './message';
import './min';
import './not-empty';
import './null';
import './number';
import './object';
import './objectid';
import './optional';
import './partialed';
import './serialize';
import './string';
import './to';
import './touch';
import './truthy';
import './typeof';
import './unique';
import './validate';
import './verify';
import './get';
export * from './decorators';
//# sourceMappingURL=itsa.d.ts.map