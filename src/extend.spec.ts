
import { describe, it } from 'mocha';
import { itsa, itsaField, ItsaSchema, itsaSchema } from "./itsa";
import assert from "assert";


@itsaSchema(itsa.extend((i:any) => { i.foo = 'bar'; }))
class IThing extends ItsaSchema {
}

describe('itsa', function() {
  describe('extend', function() {
    it('can be used first', function() {
      const schema = itsa.extend(itsa => (itsa as any).foo = 'bar').equal(1);
      assert.strictEqual((schema as any).foo, 'bar');
      assert.strictEqual(schema.validate(1).ok, true);
      assert.strictEqual(schema.validate(0).ok, false);
    });

    it('can be used last', function() {
      const schema = itsa.equal(1).extend(itsa => (itsa as any).foo = 'bar');
      assert.strictEqual(schema.validate(1).ok, true);
      assert.strictEqual(schema.validate(0).ok, false);
      assert.strictEqual((schema as any).foo, 'bar');
    });

    it('works on itsaSchema', function() {
      assert.strictEqual((IThing.schema as any).foo, 'bar');
    });
  });
});
