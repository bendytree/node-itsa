
import { Itsa, itsa } from "./itsa";
import { ItsaObjectSettings } from './object';

export class ItsaGet {
  get(this:Itsa, key:string):Itsa{
    const schema = new Itsa();
    for (const p of this.predicates) {
      if (p.id === 'object') {
        const settings = p.settings as ItsaObjectSettings;
        if (settings.example && settings.example[key]) {
          const ex = settings.example[key];
          schema._isOptional = schema._isOptional || ex._isOptional;
          schema.and(ex);
        }
      }
    }
    return schema;
  }
}

declare module './itsa' {
  interface Itsa extends ItsaGet { }
}

Itsa.extend(ItsaGet);
