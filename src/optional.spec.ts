
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
  });

  describe('optional', function() {
    it('allows falsy version of type', function() {
      assert.strictEqual(itsa.optional(itsa.string()).validate('').ok, true);
      assert.strictEqual(itsa.optional(itsa.string()).validate(0).ok, false);
      assert.strictEqual(itsa.optional(itsa.number()).validate(0).ok, true);
      assert.strictEqual(itsa.optional(itsa.number()).validate('').ok, false);
    });
  });
});
