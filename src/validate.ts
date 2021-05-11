
import { ItsaActor, ItsaActorContext } from './core';
import {ItsaVerify} from "./verify";

export interface ItsaInternalValidationSettings {
  val:any;
  key?:string|number;
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
}

export class ItsaValidationResult {
  ok: boolean = true;
  errors: ItsaError[] = [];
  value: any;
  message?: string;

  constructor(private exhaustive: boolean) { }

  addError (message:string) {
    this.ok = false;
    this.message = message;
    this.errors.push({ message }); // path: null, val,
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

export class ItsaValidate {

  _validate(settings:ItsaInternalValidationSettings):ItsaValidationResult {
    const result = new ItsaValidationResult(settings.settings.exhaustive);
    result.value = settings.val;
    try {
      const setVal = (newVal:any) => {
        if (settings.parent) {
          settings.parent[settings.key] = newVal;
          settings.val = newVal;
        }else{
          result.value = newVal;
        }
      };
      for (const action of this.actions) {
        const actor:ItsaActor = this.actors[action.actorId];
        if (!actor) throw new Error(`Actor not found: ${action.actorId}`);
        const context:ItsaActorContext = {
          setVal,
          result,
          val: settings.val,
          key: settings.key,
          parent: settings.parent,
          exists: settings.exists,
          type: typeof settings.val,
          validation: settings.settings,
        };
        actor.handler(context, action.settings);
      }
    }catch (e){
      if (e !== 'STOP_ON_FIRST_ERROR') throw e;
    }
    return result;
  }

  validate(val: any, settings:ItsaValidationSettings = {}):ItsaValidationResult {
    return this._validate({
      val,
      settings,
      key:null,
      parent:null,
      exists: true,
    });
  }
}
