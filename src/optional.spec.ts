
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('optional', function() {
    it('allows null, undefined, or the given schema', function() {
      assert.strictEqual(itsa.optional(itsa.string()).validate(null).ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate(undefined).ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate('507f191e810c19729de860ea').ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate(77).ok, false);
      assert.strictEqual(itsa.optional(itsa.string().notEmpty()).validate('').ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate(0).ok, false);
    });

    it('allows falsy version of type', function() {
      assert.strictEqual(itsa.optional(itsa.string()).validate('').ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate(0).ok, false);
      assert.strictEqual(itsa.optional(itsa.number()).validate(0).ok, true);
      assert.strictEqual(itsa.optional(itsa.number()).validate('').ok, false);
    });

    it('optional sub object must be valid if provided', function() {
      assert.strictEqual(itsa.optional(itsa.object({x: 1})).validate({}).ok, false);
    });

    it('inline optional works too', function() {
      assert.strictEqual(itsa.string().optional().validate('a').ok, true);
      assert.strictEqual(itsa.string().optional().validate(null).ok, true);
      assert.strictEqual(itsa.string().optional().validate(2).ok, false);
    });

    it('inline optional can precede it too', function() {
      assert.strictEqual(itsa.optional().string().validate('a').ok, true);
      assert.strictEqual(itsa.optional().string().validate(undefined).ok, true);
      assert.strictEqual(itsa.optional().string().validate(2).ok, false);
    });

    it('inline optional works within an object', function() {
      assert.strictEqual(itsa.object({ a: itsa.optional().string() }).validate({a: 'b'}).ok, true);
      assert.strictEqual(itsa.object({ a: itsa.optional().string() }).validate({a: null}).ok, true);
      assert.strictEqual(itsa.object({ a: itsa.optional().string() }).validate({}).ok, true);
      assert.strictEqual(itsa.object({ a: itsa.optional().string() }).validate({a: 3}).ok, false);
      assert.strictEqual(itsa.optional().string().validate(undefined).ok, true);
    });

    it('inline optional works within an array', function() {
      assert.strictEqual(itsa.array(itsa.optional().string()).validate(['a']).ok, true, 'a');
      assert.strictEqual(itsa.array(itsa.optional().string()).validate([null]).ok, true, 'null');
      assert.strictEqual(itsa.array(itsa.optional().string()).validate([2]).ok, false, '2');
    });
  });

});
