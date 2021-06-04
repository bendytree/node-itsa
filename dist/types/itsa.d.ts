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
export interface ItsaValidationResult {
    ok: boolean;
    errors: ItsaError[];
    value: any;
    message?: string;
}
export interface ItsaCombineResultsOptions {
    throw?: boolean;
}
export declare class ItsaValidationResultBuilder implements ItsaValidationResult {
    private exhaustive;
    private key;
    private path;
    ok: boolean;
    errors: any[];
    value: any;
    message?: any;
    constructor(exhaustive: boolean, key: string | number, path: (string | number)[]);
    addError(message: string, options?: ItsaCombineResultsOptions): void;
    combine(result: ItsaValidationResult, options?: ItsaCombineResultsOptions): void;
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
import './any';
import './anything';
import './array';
import './between';
import './boolean';
import './clone';
import './constructor';
import './convert';
import './date';
import './default';
import './email';
import './equal';
import './falsy';
import './function';
import './instanceof';
import './integer';
import './length';
import './matches';
import './max';
import './min';
import './not-empty';
import './null';
import './number';
import './object';
import './objectid';
import './serialize';
import './string';
import './to';
import './truthy';
import './typeof';
import './unique';
import './validate';
import './verify';
export {};
//# sourceMappingURL=itsa.d.ts.map