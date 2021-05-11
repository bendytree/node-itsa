
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('null', function() {
    it('validates', function() {
      assert.strictEqual(itsa().null().validate(null).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().null().validate(undefined).ok, false);
      assert.strictEqual(itsa().null().validate(0).ok, false);
      assert.strictEqual(itsa().null().validate(false).ok, false);
      assert.strictEqual(itsa().null().validate('').ok, false);
    });
  });

  describe('undefined', function() {
    it('validates', function() {
      assert.strictEqual(itsa().undefined().validate(undefined).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().undefined().validate(null).ok, false);
      assert.strictEqual(itsa().undefined().validate(0).ok, false);
      assert.strictEqual(itsa().undefined().validate(false).ok, false);
      assert.strictEqual(itsa().undefined().validate('').ok, false);
    });
  });
});
