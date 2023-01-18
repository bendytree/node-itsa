
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

const partialize = (schema:Itsa):void => {
  for (const p of schema.predicates) {
    if (p.id === 'object') {
      const settings:ItsaObjectSettings = p.settings;
      settings.config.partial = true;
    }

    forEachValue(p, (val) => {
      if (val instanceof Itsa) {
        partialize(val);
      }
    });
  }
};

export class ItsaPartialed {
  partialed(this:Itsa):Itsa{
    const schema = this.clone();
    partialize(schema);
    return schema as any as Itsa;
  }
}

Itsa.extend(ItsaPartialed);

declare module './itsa' {
  interface Itsa extends ItsaPartialed { }
}
