import {ItsaValidationResult, ItsaValidationSettings} from "./validate";

export interface ItsaActorContext {
  parent?:object | [];
  key?:string | number;
  exists: boolean;
  val:any;
  type: string;
  setVal:(val:any) => void;
  validation: ItsaValidationSettings;
  result: ItsaValidationResult;
}

export interface ItsaAction {
  actorId:string;
  settings:any;
}

export interface ItsaActor {
  id:string;
  handler:(ItsaActorContext, any) => void;
}

export class ItsaCore {
  public actions:ItsaAction[] = [];
  protected actors:{[key:string]:ItsaActor} = {};

  protected registerActor(actor:ItsaActor):void {
    this.actors[actor.id] = actor;
  }
}
