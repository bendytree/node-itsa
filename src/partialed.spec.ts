
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
      assert.strictEqual(partialedSchema.validate({ x: { a:undefined, b: 3 } }).ok, true);
    });

    it('partialed does not mutate original schema', function() {
      const schema = itsa.object({ x: itsa.object({ a: itsa.number(), b: itsa.number() })});
      assert.strictEqual(schema.validate({ x: { a:undefined, b: 3 } }).ok, false);
    });

    it('partialed can list specific fields', function() {
      const origSchema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const partialedSchema = origSchema.partialed(['b']);
      assert.strictEqual(origSchema.validate({ a:1 }).ok, false);
      assert.strictEqual(partialedSchema.validate({ a:1 }).ok, true);
    });

    it('partialed can list subfields', function() {
      const origSchema = itsa.object({
        a: itsa.number(),
        b: itsa.object({
          x: itsa.number(),
          y: itsa.number(),
        }),
      });
      const partialedSchema = origSchema.partialed(['b.x']);
      assert.strictEqual(partialedSchema.validate({ a:1 }).ok, false);
      assert.strictEqual(partialedSchema.validate({ a:1, b: { } }).ok, false);
      assert.strictEqual(partialedSchema.validate({ a:1, b: { x: 1 } }).ok, false);
      assert.strictEqual(partialedSchema.validate({ a:1, b: { y: 1 } }).ok, true);
      assert.strictEqual(partialedSchema.validate({ b: { y: 1 } }).ok, false);
    });

    it('partialed can list sub-object', function() {
      const origSchema = itsa.object({
        a: itsa.number(),
        b: itsa.object({
          x: itsa.number(),
          y: itsa.number(),
        }),
      });
      const partialedSchema = origSchema.partialed(['b']);
      assert.strictEqual(partialedSchema.validate({ a:1 }).ok, true, 'omitting the object is ok');
      assert.strictEqual(partialedSchema.validate({ a:1, b: { y: 1 } }).ok, false, 'if object is given, it must be valid');
    });

    it('partialed throws for unknown fields', function() {
      const origSchema = itsa.object({ a: itsa.number(), b: itsa.number() });
      try {
        origSchema.partialed(['c'])
        assert.fail('Partialed should have thrown from invalid key: c')
      }catch (e){ }
    });
  });
});
