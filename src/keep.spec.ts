
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('keep', function() {
    it('you can choose fields to keep from an object schema', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number(), c: itsa.number() });
      const keptSchema = schema.keep(['a', 'c']);
      assert.strictEqual(keptSchema.validate({ a:1, c:3 }).ok, true);
    });

    it('by default, other values are no longer allowed', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number(), c: itsa.number() });
      const keptSchema = schema.keep(['a', 'c']);
      assert.strictEqual(keptSchema.validate({ a:1, b: 2, c:3 }).ok, false);
    });

    it('other values can be partial instead', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number(), c: itsa.number() });
      const keptSchema = schema.keep(['a', 'c'], { partial: true });
      assert.strictEqual(keptSchema.validate({ a:1, b: 2, c:3 }).ok, true);
      assert.strictEqual(keptSchema.validate({ a:1, c:3 }).ok, true);
      assert.strictEqual(keptSchema.validate({ a:1, b: 'two', c:3 }).ok, false);
    });

    it('keep does not mutate original schema', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      schema.keep(['a']);
      assert.strictEqual(schema.validate({ a: 1, b: 2 }).ok, true);
      assert.strictEqual(schema.validate({ a: 1 }).ok, false);
    });

    it('you can keep subfields as well', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.object({ x: itsa.number(), y: itsa.number() }) });
      const keptSchema = schema.keep(['b.x']);
      assert.strictEqual(keptSchema.validate({ a:1, b: { x: 1 } }).ok, false, 'a should not have been kept');
      assert.strictEqual(keptSchema.validate({ b: { x: 1, y: 1 } }).ok, false, 'b.y should not have been kept');
      assert.strictEqual(keptSchema.validate({ }).ok, false, 'b should still be required');
      assert.strictEqual(keptSchema.validate({ b: { x: 1 } }).ok, true, 'b.x alone should be valid');
    });

    it('you can keep subfields with the partial flag', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.object({ x: itsa.number(), y: itsa.number() }) });
      const keptSchema = schema.keep(['b.x'], { partial: true });
      assert.strictEqual(keptSchema.validate({ a:1, b: { x: 1 } }).ok, true, 'a should be allowed');
      assert.strictEqual(keptSchema.validate({ a:'A', b: { x: 1 } }).ok, false, 'a cant be a string though');
      assert.strictEqual(keptSchema.validate({ b: { x: 1 } }).ok, true, 'b.x alone should still be valid');
      assert.strictEqual(keptSchema.validate({ b: { x: 1, y: 1 } }).ok, true, 'b.y should still be valid');
      assert.strictEqual(keptSchema.validate({ }).ok, false, 'b should still be required');
    });

    it('keep requires array of fields', function() {
      const schema = itsa.object({ a: itsa.number() });
      try {
        schema.keep(null);
        assert.fail('An error was expected');
      }catch (e){}
    });

    it('keeping an empty array expects a blank object', function() {
      const schema = itsa.object({ a: itsa.number() });
      const keptSchema = schema.keep([]);
      assert.strictEqual(keptSchema.validate({ }).ok, true, 'blank schema should be fine');
      assert.strictEqual(keptSchema.validate({ a: 1 }).ok, false, 'a should not have been kept');
    });

    it('keeping an empty array can still use partial', function() {
      const schema = itsa.object({ a: itsa.number() });
      const keptSchema = schema.keep([], { partial: true });
      assert.strictEqual(keptSchema.validate({ }).ok, true, 'blank schema should be fine');
      assert.strictEqual(keptSchema.validate({ a: 1 }).ok, true, 'a should still be allowed');
      assert.strictEqual(keptSchema.validate({ a: 'one' }).ok, false, 'a should be valid if it exists');
    });

  });
});
