
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('integer', function() {
    it('validates', function() {
      assert.strictEqual(itsa.integer().validate(-100.0).ok, true);
      assert.strictEqual(itsa.integer().validate(0).ok, true);
      assert.strictEqual(itsa.integer().validate(1.000).ok, true);
      assert.strictEqual(itsa.integer().validate(237423).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa.integer().validate(-100.1).ok, false);
      assert.strictEqual(itsa.integer().validate(0.9999999).ok, false);
      assert.strictEqual(itsa.integer().validate(1.23).ok, false);
      assert.strictEqual(itsa.integer().validate(237423.000001).ok, false);
      assert.strictEqual(itsa.integer().validate(Number.NEGATIVE_INFINITY).ok, false);
      assert.strictEqual(itsa.integer().validate(Number.POSITIVE_INFINITY).ok, false);
      assert.strictEqual(itsa.integer().validate(NaN).ok, false);
      assert.strictEqual(itsa.integer().validate([]).ok, false);
      assert.strictEqual(itsa.integer().validate(null).ok, false);
      assert.strictEqual(itsa.integer().validate('3').ok, false);
    });
  });
});
