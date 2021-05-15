declare type ItsaOrPrimative = Itsa | number | string | boolean | null | undefined | Function;

declare class ItsaAny {
    any(this: Itsa, ...options: (ItsaOrPrimative | ItsaOrPrimative[])[]): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaAny {
    }
}

declare class ItsaAnything {
    anything(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaAnything {
    }
}

declare class ItsaArray {
    array(this: Itsa, example?: ItsaOrPrimative): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaArray {
    }
}

interface ItsaBetweenExtraSettings {
    inclusive?: boolean;
}
declare class ItsaBetween {
    between(this: Itsa, min: any, max: any, extraSettings?: ItsaBetweenExtraSettings): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaBetween {
    }
}

declare class ItsaBoolean {
    boolean(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaBoolean {
    }
}

declare class ItsaConstructor {
    constructorIs(this: Itsa, cls: Function): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaConstructor {
    }
}

declare class ItsaConvert {
    convert(this: Itsa, converter: Function): Itsa;
    to(this: Itsa, converter: Function): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaConvert {
    }
}

declare class ItsaDate {
    date(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaDate {
    }
}

interface ItsaDefaultSettings {
    val?: any;
    falsy?: boolean;
}
declare class ItsaDefault {
    default(this: Itsa, val: any, settings?: ItsaDefaultSettings): Itsa;
    defaultNow(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaDefault {
    }
}

declare class ItsaEmail {
    email(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaEmail {
    }
}

interface ItsaEqualSettings {
    strict?: boolean;
    example?: any;
}
declare class ItsaEqual {
    equal(this: Itsa, val: any, settings?: ItsaEqualSettings): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaEqual {
    }
}

declare class ItsaFalsy {
    falsy(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaFalsy {
    }
}

interface ItsaFunctionIncomingSettings {
    length?: ItsaOrPrimative;
}
declare class ItsaFunction {
    function(this: Itsa, settings?: ItsaFunctionIncomingSettings): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaFunction {
    }
}

declare class ItsaInstanceOf {
    instanceof(this: Itsa, cls: any): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaInstanceOf {
    }
}

declare class ItsaInteger {
    integer(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaInteger {
    }
}

declare class ItsaLength {
    length(this: Itsa, min?: number, max?: number): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaLength {
    }
}

declare class ItsaMatches {
    matches(this: Itsa, regex: RegExp): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaMatches {
    }
}

declare class ItsaMax {
    max(this: Itsa, max: any, inclusive?: boolean): Itsa;
    under(this: Itsa, max: any, inclusive?: boolean): Itsa;
    below(this: Itsa, max: any, inclusive?: boolean): Itsa;
    atMost(this: Itsa, max: any, inclusive?: boolean): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaMax {
    }
}

declare class ItsaMin {
    min(this: Itsa, min: any, inclusive?: boolean): Itsa;
    over(this: Itsa, min: any, inclusive?: boolean): Itsa;
    above(this: Itsa, min: any, inclusive?: boolean): Itsa;
    atLeast(this: Itsa, min: any, inclusive?: boolean): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaMin {
    }
}

declare class ItsaNotEmpty {
    notEmpty(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaNotEmpty {
    }
}

declare class ItsaNull {
    null(this: Itsa): Itsa;
    undefined(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaNull {
    }
}

declare class ItsaNumber {
    number(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaNumber {
    }
}

interface ItsaObjectExampleWithPrimitives {
    [key: string]: ItsaOrPrimative;
}
interface ItsaObjectConfig {
    extras?: boolean;
    key?: Itsa;
    value?: Itsa;
}
declare class ItsaObject {
    object(this: Itsa, example?: ItsaObjectExampleWithPrimitives, config?: ItsaObjectConfig): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaObject {
    }
}

declare class ItsaObjectId {
    objectid(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaObjectId {
    }
}

declare type RawItsa = {
    predicates: ItsaPredicate[];
};
declare class ItsaSerialize {
    load(this: Itsa, raw: RawItsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaSerialize {
    }
}

declare class ItsaString {
    string(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaString {
    }
}

declare class ItsaTo {
    toDate(this: Itsa): Itsa;
    toFloat(this: Itsa): Itsa;
    toInt(this: Itsa, radix?: number): Itsa;
    toLowerCase(this: Itsa): Itsa;
    toUpperCase(this: Itsa): Itsa;
    toNow(this: Itsa): Itsa;
    toString(this: Itsa): Itsa;
    toTrimmed(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaTo {
    }
}

declare class ItsaTruthy {
    truthy(this: Itsa): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaTruthy {
    }
}

declare class ItsaTypeOf {
    typeof(this: Itsa, type: string): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaTypeOf {
    }
}

declare class ItsaUnique {
    unique(this: Itsa, getter?: Function): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaUnique {
    }
}

declare class ItsaValidation {
    _validate(this: Itsa, settings: ItsaInternalValidationSettings): ItsaValidationResult;
    validate(this: Itsa, val: any, settings?: ItsaValidationSettings): ItsaValidationResult;
    validOrThrow(this: Itsa, val: any, settings?: ItsaValidationSettings): void;
}
declare module './index' {
    interface Itsa extends ItsaValidation {
    }
}

declare class ItsaVerify {
    verify(this: Itsa, verifier: Function): Itsa;
}
declare module './index' {
    interface Itsa extends ItsaVerify {
    }
}

interface ItsaInternalValidationSettings {
    val: any;
    key?: string | number;
    path: (string | number)[];
    parent?: object | [];
    exists: boolean;
    settings: ItsaValidationSettings;
}
interface ItsaValidationSettings {
    partial?: boolean;
    exhaustive?: boolean;
}
interface ItsaError {
    message: string;
    key: string | number;
    path: (string | number)[];
}
declare class ItsaValidationException extends Error {
    message: string;
    result: ItsaValidationResult;
}
declare class ItsaValidationResult {
    private exhaustive;
    private key;
    private path;
    ok: boolean;
    errors: ItsaError[];
    value: any;
    message?: string;
    constructor(exhaustive: boolean, key: string | number, path: (string | number)[]);
    addError(message: string): void;
    combine(result: ItsaValidationResult): void;
}
interface ItsaValidateContext {
    parent?: object | [];
    key?: string | number;
    path: (string | number)[];
    exists: boolean;
    val: any;
    type: string;
    setVal: (val: any) => void;
    validation: ItsaValidationSettings;
    result: ItsaValidationResult;
}
interface ItsaPredicate {
    id: string;
    settings?: any;
}
interface ItsaValidator {
    id: string;
    validate: (ItsaValidateContext: any, any: any) => void;
}
declare type ItsaSubclass = new (...args: any[]) => any;
declare const itsa: Itsa;
declare class Itsa {
    predicates: ItsaPredicate[];
    static validators: {
        [key: string]: ItsaValidator;
    };
    static extend(cls: ItsaSubclass, ...validators: ItsaValidator[]): void;
}

export { Itsa, ItsaError, ItsaInternalValidationSettings, ItsaPredicate, ItsaValidateContext, ItsaValidationException, ItsaValidationResult, ItsaValidationSettings, ItsaValidator, itsa };
