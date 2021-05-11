
import {ItsaActorContext} from "./core";
import { Itsa } from "./index";
import {ItsaString} from "./string";

interface ItsaToIntSettings {
  radix?:number;
}

export class ItsaTo extends ItsaString {
  constructor() {
    super();

    this.registerActor({
      id: 'toDate',
      handler: (context:ItsaActorContext) => {
        const { val, setVal, result } = context;
        const date = new Date(val);
        if (!isFinite(date.getTime())) return result.addError(`Date conversion failed`);
        setVal(date);
      }
    });

    this.registerActor({
      id: 'toFloat',
      handler: (context:ItsaActorContext) => {
        const { val, setVal, result } = context;
        const newFloat = parseFloat(val);
        if (isNaN(newFloat)) return result.addError(`Float conversion failed`);
        setVal(newFloat);
      }
    });

    this.registerActor({
      id: 'toInt',
      handler: (context:ItsaActorContext, settings:ItsaToIntSettings) => {
        const { val, setVal, result } = context;
        const { radix } = settings;
        const newFloat = parseInt(val, radix ?? 10);
        if (isNaN(newFloat)) return result.addError(`Float conversion failed`);
        setVal(newFloat);
      }
    });

    this.registerActor({
      id: 'toLowerCase',
      handler: (context:ItsaActorContext) => {
        const { val, setVal } = context;
        setVal(String(val).toLowerCase());
      }
    });

    this.registerActor({
      id: 'toUpperCase',
      handler: (context:ItsaActorContext) => {
        const { val, setVal } = context;
        setVal(String(val).toUpperCase());
      }
    });

    this.registerActor({
      id: 'toNow',
      handler: (context:ItsaActorContext) => {
        const { setVal } = context;
        setVal(new Date());
      }
    });

    this.registerActor({
      id: 'toString',
      handler: (context:ItsaActorContext) => {
        const { val, setVal } = context;
        setVal(String(val));
      }
    });

    this.registerActor({
      id: 'toTrimmed',
      handler: (context:ItsaActorContext) => {
        const { val, setVal } = context;
        setVal(String(val).trim());
      }
    });
  }
  toDate():Itsa{
    this.actions.push({ actorId: 'toDate', settings:null });
    return this as any as Itsa;
  }
  toFloat():Itsa{
    this.actions.push({ actorId: 'toFloat', settings:null });
    return this as any as Itsa;
  }
  toInt(radix?:number):Itsa{
    const settings:ItsaToIntSettings = { radix };
    this.actions.push({ actorId: 'toInt', settings });
    return this as any as Itsa;
  }
  toLowerCase():Itsa{
    this.actions.push({ actorId: 'toLowerCase', settings: null });
    return this as any as Itsa;
  }
  toUpperCase():Itsa{
    this.actions.push({ actorId: 'toUpperCase', settings: null });
    return this as any as Itsa;
  }
  toNow():Itsa{
    this.actions.push({ actorId: 'toNow', settings: null });
    return this as any as Itsa;
  }
  toString():Itsa{
    this.actions.push({ actorId: 'toString', settings: null });
    return this as any as Itsa;
  }
  toTrimmed():Itsa{
    this.actions.push({ actorId: 'toTrimmed', settings: null });
    return this as any as Itsa;
  }
}
