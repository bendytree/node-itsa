
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
    });
  });
});
