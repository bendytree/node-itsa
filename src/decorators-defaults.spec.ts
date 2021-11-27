
import { describe, it } from 'mocha';
import { itsa, itsaSchema, itsaField, ItsaSchema } from "./itsa";
import assert from "assert";

@itsaSchema()
class IDog extends ItsaSchema {
  @itsaField(itsa.number().default(4))
  legs:number;
}


@itsaSchema()
class IUser extends ItsaSchema {
  @itsaField(itsa.string().default('Sunny'))
  name:string;
  @itsaField(IDog.schema)
  dog:IDog;
}

describe('itsa', function() {
  describe('decorators-defaults', function() {
    it('works', function() {
      const user = new IUser();
      assert.strictEqual(user.name, 'Sunny');
    });

    it('works for nested schemas too', function() {
      const user = new IUser();
      assert.strictEqual(user.name, 'Sunny');
      assert.strictEqual(user.dog.legs, 4);
      assert.strictEqual(JSON.stringify(user), `{"name":"Sunny","dog":{"legs":4}}`);
    });
  });
});
