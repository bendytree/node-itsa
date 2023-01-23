
import {Itsa} from "./itsa";
import { ItsaObjectSettings } from './object';

const forEachValue = (obj, handler) => {
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    handler(val);
    if (val && typeof obj[key] === 'object') {
      forEachValue(val, handler);
    }
  })
};

const partialize = (schema:Itsa, fields?:string[]):void => {
  for (const p of schema.predicates) {
    if (p.id === 'object') {
      const settings:ItsaObjectSettings = p.settings;
      if (fields) {
        for (const field of fields) {
          const [key, ...restOfKeys] = field.split('.');
          const ex:Itsa = settings.example[key];
          if (!ex) {
            continue;
          }else if (restOfKeys.length) {
            partialize(ex, [restOfKeys.join('.')]);
          }else{
            for (const [i, pred] of ex.predicates?.entries()) {
              if (pred.id === 'optional') continue;
              const allowedSchema = new Itsa();
              allowedSchema.predicates = [pred];
              ex.predicates[i] = { id: 'optional', settings: { allowedSchema } };
            }
          }
        }
      }else{
        settings.config.partial = true;
      }
    }

    if (!fields){
      forEachValue(p, (val) => {
        if (val instanceof Itsa) {
          partialize(val);
        }
      });
    }
  }
};

export class ItsaPartialed {
  partialed(this:Itsa, fields?:string[]):Itsa{
    const schema = this.clone();
    partialize(schema, fields);
    return schema as any as Itsa;
  }
}

Itsa.extend(ItsaPartialed);

declare module './itsa' {
  interface Itsa extends ItsaPartialed { }
}
