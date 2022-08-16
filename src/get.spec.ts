
import { describe, it } from 'mocha';
import { itsa, itsaField, ItsaSchema, itsaSchema } from "./itsa";
import assert from "assert";


@itsaSchema()
class IThing extends ItsaSchema {
  @itsaField(itsa.string())
  id: string;
  @itsaField(itsa.number().between(5, 7))
  age: string;
}

describe('itsa', function() {
  describe('get', function() {
    it('can get the sub-schema for an object key', function() {
      const idSchema = IThing.schema.get('id');
      const ageSchema = IThing.schema.get('age');
      assert.strictEqual(idSchema.validate('abc').ok, true, 'abc should be a valid id');
      assert.strictEqual(idSchema.validate(99).ok, false, '99 should not be a valid id');
      assert.strictEqual(ageSchema.validate('abc').ok, false, 'abc should not be a valid age');
      assert.strictEqual(ageSchema.validate(99).ok, false, '99 should not be a valid age');
      assert.strictEqual(ageSchema.validate(6).ok, true, '6 should be a valid age');
    });
  });
});
