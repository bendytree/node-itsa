
import {Itsa, ItsaHandlerContext} from "./index";

interface ItsaToIntSettings {
  radix?:number;
}

export class ItsaTo {
  toDate(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toDate', settings:null });
    return this as any as Itsa;
  }
  toFloat(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toFloat', settings:null });
    return this as any as Itsa;
  }
  toInt(this:Itsa, radix?:number):Itsa{
    const settings:ItsaToIntSettings = { radix };
    this.actions.push({ handlerId: 'toInt', settings });
    return this as any as Itsa;
  }
  toLowerCase(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toLowerCase' });
    return this as any as Itsa;
  }
  toUpperCase(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toUpperCase' });
    return this as any as Itsa;
  }
  toNow(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toNow' });
    return this as any as Itsa;
  }
  toString(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toString' });
    return this as any as Itsa;
  }
  toTrimmed(this:Itsa):Itsa{
    this.actions.push({ handlerId: 'toTrimmed' });
    return this as any as Itsa;
  }
}

Itsa.extend(
  ItsaTo,
  {
    id: 'toDate',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal, result } = context;
      const date = new Date(val);
      if (!isFinite(date.getTime())) return result.addError(`Date conversion failed`);
      setVal(date);
    }
  },
  {
    id: 'toFloat',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal, result } = context;
      const newFloat = parseFloat(val);
      if (isNaN(newFloat)) return result.addError(`Float conversion failed`);
      setVal(newFloat);
    }
  },
  {
    id: 'toInt',
    handler: (context:ItsaHandlerContext, settings:ItsaToIntSettings) => {
      const { val, setVal, result } = context;
      const { radix } = settings;
      const newInt = parseInt(val, radix ?? 10);
      if (isNaN(newInt)) return result.addError(`Int conversion failed`);
      setVal(newInt);
    }
  },
  {
    id: 'toLowerCase',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal } = context;
      setVal(String(val).toLowerCase());
    }
  },
  {
    id: 'toUpperCase',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal } = context;
      setVal(String(val).toUpperCase());
    }
  },
  {
    id: 'toNow',
    handler: (context:ItsaHandlerContext) => {
      const { setVal } = context;
      setVal(new Date());
    }
  },
  {
    id: 'toString',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal } = context;
      setVal(String(val));
    }
  },
  {
    id: 'toTrimmed',
    handler: (context:ItsaHandlerContext) => {
      const { val, setVal } = context;
      setVal(String(val).trim());
    }
  },
);

declare module './index' {
  interface Itsa extends ItsaTo { }
}
