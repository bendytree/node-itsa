
import {Itsa, ItsaValidateContext} from "./itsa";

interface ItsaToIntSettings {
  radix?:number;
}

export class ItsaTo {
  toDate(this:Itsa):Itsa{
    this.predicates.push({ id: 'toDate', settings:null });
    return this as any as Itsa;
  }
  toFloat(this:Itsa):Itsa{
    this.predicates.push({ id: 'toFloat', settings:null });
    return this as any as Itsa;
  }
  toInt(this:Itsa, radix?:number):Itsa{
    const settings:ItsaToIntSettings = { radix };
    this.predicates.push({ id: 'toInt', settings });
    return this as any as Itsa;
  }
  toLowerCase(this:Itsa):Itsa{
    this.predicates.push({ id: 'toLowerCase' });
    return this as any as Itsa;
  }
  toUpperCase(this:Itsa):Itsa{
    this.predicates.push({ id: 'toUpperCase' });
    return this as any as Itsa;
  }
  toNow(this:Itsa):Itsa{
    this.predicates.push({ id: 'toNow' });
    return this as any as Itsa;
  }
  toString(this:Itsa):Itsa{
    this.predicates.push({ id: 'toString' });
    return this as any as Itsa;
  }
  toTrimmed(this:Itsa):Itsa{
    this.predicates.push({ id: 'toTrimmed' });
    return this as any as Itsa;
  }
}

Itsa.extend(
  ItsaTo,
  {
    id: 'toDate',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal, result } = context;
      const date = new Date(val);
      if (!isFinite(date.getTime())) return result.addError(`Date conversion failed`);
      setVal(date);
    }
  },
  {
    id: 'toFloat',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal, result } = context;
      const newFloat = parseFloat(val);
      if (isNaN(newFloat)) return result.addError(`Float conversion failed`);
      setVal(newFloat);
    }
  },
  {
    id: 'toInt',
    validate: (context:ItsaValidateContext, settings:ItsaToIntSettings) => {
      const { val, setVal, result } = context;
      const { radix } = settings;
      const newInt = parseInt(val, radix ?? 10);
      if (isNaN(newInt)) return result.addError(`Int conversion failed`);
      setVal(newInt);
    }
  },
  {
    id: 'toLowerCase',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal } = context;
      setVal(String(val).toLowerCase());
    }
  },
  {
    id: 'toUpperCase',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal } = context;
      setVal(String(val).toUpperCase());
    }
  },
  {
    id: 'toNow',
    validate: (context:ItsaValidateContext) => {
      const { setVal } = context;
      setVal(new Date());
    }
  },
  {
    id: 'toString',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal } = context;
      setVal(String(val));
    }
  },
  {
    id: 'toTrimmed',
    validate: (context:ItsaValidateContext) => {
      const { val, setVal } = context;
      setVal(String(val).trim());
    }
  },
);

declare module './itsa' {
  interface Itsa extends ItsaTo { }
}
