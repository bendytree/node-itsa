import {Itsa} from "./itsa";

Itsa.prototype.message = Itsa.prototype.msg = function (this: Itsa, message: string):Itsa {
  const predicate = this.predicates[this.predicates.length - 1];
  predicate.settings = predicate.settings || {};
  predicate.settings._message = message;
  return this;
};

declare module './itsa' {
  interface Itsa {
    message(message:string):this;
    msg(message:string):this;
  }
}
