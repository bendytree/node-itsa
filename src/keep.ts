
import {Itsa} from "./itsa";
import { ItsaObjectSettings } from './object';

interface ItsaKeepConfig {
  partial?: boolean;
}

const keep = (schema:Itsa, fields:string[], config:ItsaKeepConfig):void => {
  const parsedFields = fields.map(f => {
    const [key, ...rest] = f.split('.');
    return { key, rest};
  });
  for (const p of schema.predicates) {
    if (p.id === 'object') {
      const settings:ItsaObjectSettings = p.settings;
      const keysToDelete = [];
      for (const key of Object.keys(settings.example)) {
        const exampleForKey:Itsa = settings.example[key];
        const matchingFields = parsedFields.filter(pf => pf.key === key);
        if (matchingFields.length) {
          for (const field of matchingFields) {
            if (field.rest.length) {
              keep(exampleForKey, field.rest, config);
            }else{
              // nothing to do
            }
          }
        }else if (config.partial){
          exampleForKey._isOptional = true;
        }else{
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        delete settings.example[key];
      }
    }
  }
};

export class ItsaKeep {
  keep(this:Itsa, fields:string[], config:ItsaKeepConfig = {}):Itsa{
    if (!fields) throw new Error('fields parameter is required');
    const schema = this.clone();
    keep(schema, fields, config);
    return schema as any as Itsa;
  }
}

Itsa.extend(ItsaKeep);

declare module './itsa' {
  interface Itsa extends ItsaKeep { }
}
