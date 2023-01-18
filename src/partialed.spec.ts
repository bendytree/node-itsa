
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('partialed', function() {
    it('partialed can be applied to existing schemas', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const partialedSchema = schema.partialed();
      assert.strictEqual(partialedSchema.validate({ a:1 }).ok, true);
    });

    it('partialed applies to subtrees', function() {
      const schema = itsa.object({ x: itsa.object({ a: itsa.number(), b: itsa.number() })});
      const partialedSchema = schema.partialed();
      assert.strictEqual(partialedSchema.validate({ x: { a:null, b: 3 } }).ok, true);
    });

    it('partialed does not mutate original schema', function() {
      const schema = itsa.object({ x: itsa.object({ a: itsa.number(), b: itsa.number() })});
      assert.strictEqual(schema.validate({ x: { a:null, b: 3 } }).ok, false);
    });
  });
});
