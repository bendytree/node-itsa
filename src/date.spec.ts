
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('date', function() {
    it('validates good dates', function() {
      assert.strictEqual(itsa().date().validate(new Date()).ok, true);
      assert.strictEqual(itsa().date().validate(new Date(1524644932046)).ok, true);
    });

    it('invalidates bad dates', function() {
      assert.strictEqual(itsa().date().validate(new Date('red')).ok, false);
    });

    it('invalidates anything else', function() {
      assert.strictEqual(itsa().date().validate(0).ok, false);
      assert.strictEqual(itsa().date().validate(Date.now()).ok, false);
      assert.strictEqual(itsa().date().validate(true).ok, false);
      assert.strictEqual(itsa().date().validate(false).ok, false);
      assert.strictEqual(itsa().date().validate(null).ok, false);
      assert.strictEqual(itsa().date().validate(undefined).ok, false);
      assert.strictEqual(itsa().date().validate({}).ok, false);
      assert.strictEqual(itsa().date().validate(/s/).ok, false);
    });
  });
});
