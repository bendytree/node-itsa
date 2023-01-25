import { ItsaDefaultSettings } from './default';

export interface ItsaInternalValidationSettings {
  val:any;
  key?:string|number;
  path:(string|number)[];
  parent?:object|[];
  exists: boolean;
  settings:ItsaValidationSettings;
}

export interface ItsaValidationSettings {
  partial?:boolean;
  exhaustive?:boolean;
  hint?:string;
}

export interface ItsaError {
  message:string;
  key:string | number;
  path:(string | number)[];
}

export class ItsaValidationException extends Error {
  message: string;
  result: ItsaValidationResult;

  constructor(result:ItsaValidationResult) {
    super();
    const path = result.errors[0].path.join('.');
    this.message = `${path ? `${path}: ` : ''}${result.errors[0].message}`;
    this.result = result;
  }
}

export class ItsaValidationResult {
  ok: boolean = true;
  errors: ItsaError[] = [];
  value: any;
  message?: string;

  okOrThrow(){
    if (!this.ok) throw new ItsaValidationException(this);
  }

  addError(error:ItsaError) {
    this.ok = false;
    this.message = error.message;
    this.errors.push(error);
  }

  addResult(result: ItsaValidationResult) {
    if (!result.ok) this.ok = false;
    for (const e of result.errors) {
      this.errors.push(e);
    }
    if (!this.message && this.errors.length) {
      const err = this.errors[0];
      this.message = err.message;
      // if (err.path && err.path.length) {
      //   this.message += ` (${(err.path||[]).join('.')})`;
      // }
    }
  }
}

export class ItsaValidationResultBuilder extends ItsaValidationResult {
  ok = true;
  errors = [];
  value = undefined;
  hint? = undefined;
  message? = undefined;

  private readonly exhaustive: boolean;
  private readonly key: string | number;
  private readonly path: (string | number)[];
  private messageFormat?: string;

  constructor(exhaustive: boolean, key: string | number, path: (string | number)[], hint?: string) {
    super();
    this.key = key;
    this.exhaustive = exhaustive;
    this.path = path;
    this.hint = hint;
  }

  registerError (message:string, val: any) {
    message = this.hint ? `${this.hint}: ${message}` : message;
    const result = new ItsaValidationResult();
    const pathStr = this.path?.join?.('.');
    if (this.messageFormat) {
      message = this.messageFormat
        .replace('{message}', message)
        .replace('{msg}', message)
        .replace('{path}', pathStr);

      const msgDataSegments = message.split('{data}');
      if (msgDataSegments.length > 1) {
        message = msgDataSegments.join(JSON.stringify(val));
      }
    }else{
      if (pathStr) {
        message = `${pathStr}: ${message}`;
      }
    }
    result.addError({ message, key: this.key, path: this.path });
    this.addResult(result);
  }

  registerResult(result: ItsaValidationResult):void{
    this.addResult(result);
    if (!this.exhaustive && this.errors.length) {
      throw 'STOP_ON_FIRST_ERROR';
    }
  }

  withMessageFormat(messageFormat?: string):this {
    this.messageFormat = messageFormat;
    return this;
  }
}

export interface ItsaValidateContext {
  parent?:object | [];
  key?:string | number;
  path:(string | number)[];
  exists: boolean;
  val:any;
  type: string;
  setVal:(val:any) => void;
  validation: ItsaValidationSettings;
  result: ItsaValidationResultBuilder;
}

export interface ItsaPredicate {
  id:string;
  settings?:any;
}

export interface ItsaValidator {
  id:string;
  validate:(ItsaValidateContext, any) => void;
  builder?:(settings) => any;
}

type ItsaSubclass = new (...args: any[]) => any;

export class Itsa {
  predicates:ItsaPredicate[] = [];
  static validators:{[key:string]:ItsaValidator} = {};

  static extend(cls:ItsaSubclass, ...validators: ItsaValidator[]) {
    for (const validator of validators) {
      Itsa.validators[validator.id] = validator;
    }

    const keys = Object.getOwnPropertyNames(cls.prototype).filter(m => m !== 'constructor');
    for (const key of keys) {
      const val = cls.prototype[key];
      Itsa.prototype[key] = val;

      /* istanbul ignore next */
      if (typeof val === 'function') {
        itsa[key] = (...args) => {
          const it = new Itsa();
          return it[key](...args);
        };
      }
    }
  }
}

export const itsa:Itsa = { predicates: [] } as Itsa;

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
import './schema';
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
