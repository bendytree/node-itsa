
import { describe, it } from 'mocha';
import { itsa, itsaSchema, itsaField, ItsaSchema } from "./itsa";
import assert from "assert";
import _ from "lodash";

@itsaSchema(itsa.object({ fingers: itsa.number() }))
class IUser extends ItsaSchema {
  @itsaField(itsa.string().notEmpty())
  name:string;
  @itsaField(itsa.any(itsa.integer(), null, undefined))
  age?:number;
}

class IDog extends ItsaSchema {
  @itsaField(itsa.number())
  legs:number;
}

class IFurniture extends ItsaSchema {
  @itsaField(itsa.number())
  legs:number;
}

class ICouch extends IFurniture {
  @itsaField(itsa.number())
  seats:number;
}

class ITable extends IFurniture {
  @itsaField(itsa.string())
  shape:string;
}

@itsaSchema(itsa.object({ }, { extras: true }))
class IAllowExtras extends ItsaSchema {
  @itsaField(itsa.string().notEmpty())
  name:string;
}

class INoExtras extends ItsaSchema {
  @itsaField(itsa.string().notEmpty())
  name:string;
}

class IReuseFields extends ItsaSchema {
  @itsaField(itsa.optional(IUser.schema.get('name')))
  name?:string;
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

    it('supports multiple schemas', function() {
      const user = { name: 'Sam', age: 21, fingers: 10 };
      const dog = { legs: 4 };
      assert.strictEqual(IUser.schema.validate(user).ok, true);
      assert.strictEqual(IUser.schema.validate(dog).ok, false);
      assert.strictEqual(IDog.schema.validate(user).ok, false);
      assert.strictEqual(IDog.schema.validate(dog).ok, true);
      assert.strictEqual(IDog.schema !== IUser.schema, true);

      const userExample = {};
      IUser.schema.touch(userExample);
      const userFields = _.sortBy(Object.keys(userExample));
      assert.strictEqual(userFields.join(','), 'age,fingers,name');

      const dogExample = {};
      IDog.schema.touch(dogExample);
      const dogFields = _.sortBy(Object.keys(dogExample));
      assert.strictEqual(dogFields.join(','), 'legs');
    });

    it('supports multiple, nested schemas', function() {
      const couch = {};
      ICouch.schema.touch(couch);
      const couchFields = _.sortBy(Object.keys(couch));
      assert.strictEqual(couchFields.join(','), 'legs,seats');

      const tableExample = {};
      ITable.schema.touch(tableExample);
      const tableFields = _.sortBy(Object.keys(tableExample));
      assert.strictEqual(tableFields.join(','), 'legs,shape');
    });

    it('can allow extras', function() {
      const userWithoutExtras = { name: 'Sam' };
      const userWithExtras = { name: 'Sam', age: 21 };
      assert.strictEqual(INoExtras.schema.validate(userWithExtras).ok, false, 'Extras shouldnt be allowed');
      assert.strictEqual(INoExtras.schema.validate(userWithoutExtras).ok, true, 'No extras should be valid on no extras schema');
      assert.strictEqual(IAllowExtras.schema.validate(userWithoutExtras).ok, true, 'No extras should be valid on allow extras schema');
      assert.strictEqual(IAllowExtras.schema.validate(userWithExtras).ok, true, 'Extras should be valid on allow extras schema');
    });

    it('can reuse field schemas', function() {
      assert.strictEqual(IReuseFields.schema.validate({ name: 'Sam' }).ok, true, 'Reuse: name with length is ok');
      assert.strictEqual(IReuseFields.schema.validate({ }).ok, true, 'Reuse: blank name is ok');
      assert.strictEqual(IReuseFields.schema.validate({ name: 5 }).ok, false, 'Reuse: number name not ok');
    });
  });
});
