
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
}

export interface ItsaError {
  message:string;
  key:string | number;
  path:(string | number)[];
}

export class ItsaValidationException extends Error {
  message: string;
  result: ItsaValidationResult;
}

export class ItsaValidationResult {
  ok: boolean = true;
  errors: ItsaError[] = [];
  value: any;
  message?: string;

  constructor(private exhaustive: boolean, private key: string | number, private path: (string | number)[]) { }

  addError (message:string) {
    this.ok = false;
    this.message = message;
    this.errors.push({ message, key:this.key, path:this.path }); // path: null, val,
    if (!this.exhaustive) {
      throw 'STOP_ON_FIRST_ERROR';
    }
  }

  combine(result: ItsaValidationResult):void{
    this.ok = this.ok && result.ok;
    for (const e of result.errors) {
      this.errors.push(e);
      if (!this.exhaustive) {
        throw 'STOP_ON_FIRST_ERROR';
      }
    }
  }
}

export interface ItsaHandlerContext {
  parent?:object | [];
  key?:string | number;
  path:(string | number)[];
  exists: boolean;
  val:any;
  type: string;
  setVal:(val:any) => void;
  validation: ItsaValidationSettings;
  result: ItsaValidationResult;
}

export interface ItsaAction {
  handlerId:string;
  settings:any;
}

export interface ItsaHandler {
  id:string;
  handler:(ItsaHandlerContext, any) => void;
}

type ItsaSubclass = new (...args: any[]) => any;

export const itsa = { actions: [] } as Itsa;

export class Itsa {
  actions:ItsaAction[] = [];
  static handlers:{[key:string]:ItsaHandler} = {};

  static extend(cls:ItsaSubclass, ...handlers: ItsaHandler[]) {
    for (const handler of handlers) {
      Itsa.handlers[handler.id] = handler;
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

  // toJSON():string {
  //
  // }
}

import './any';
import './anything';
import './array';
import './between';
import './boolean';
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
