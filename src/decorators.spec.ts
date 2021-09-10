
import { describe, it } from 'mocha';
import { itsa, itsaSchema, itsaField, ItsaSchema } from "./itsa";
import assert from "assert";

@itsaSchema(itsa.object({ fingers: itsa.number() }))
class IUser extends ItsaSchema {
  @itsaField(itsa.string().notEmpty())
  name:string;
  @itsaField(itsa.any(itsa.integer(), null, undefined))
  age?:number;
}

describe('itsa', function() {
  describe('decorators', function() {
    it('works', function() {
      const run = (user:any, expected:boolean) => {
        const actual = IUser.schema.validate(user).ok;
        if (actual !== expected) {
          console.log(JSON.stringify(IUser.schema.predicates, null, 2));
          assert.fail(`${JSON.stringify(user)} should be ${expected ? 'valid' : 'invalid'}`);
        }
      };
      run({ name: 'Sam', age: 21, fingers: 10 }, true);
      run({ name: 'Sam', age: 21 }, false);
      run({ name: 'Sam', fingers: 10 }, true);
      run({ name: 'Sam', age: 'old', fingers: 10 }, false);
      run({ fingers: 10 }, false);
      run({ }, false);
    });
  });
});
