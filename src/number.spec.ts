
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('number', function() {
    it('validates real numbers', function() {
      assert.strictEqual(itsa.number().validate(-1).ok, true);
      assert.strictEqual(itsa.number().validate(0).ok, true);
      assert.strictEqual(itsa.number().validate(1).ok, true);
      assert.strictEqual(itsa.number().validate(1.376).ok, true);
    });

    it('rejects nan', function() {
      assert.strictEqual(itsa.number().validate(NaN).ok, false);
    });

    it('rejects infinity', function() {
      assert.strictEqual(itsa.number().validate(Infinity).ok, false);
    });

    it('rejects other stuff', function() {
      assert.strictEqual(itsa.number().validate('2').ok, false);
      assert.strictEqual(itsa.number().validate([]).ok, false);
      assert.strictEqual(itsa.number().validate({}).ok, false);
      assert.strictEqual(itsa.number().validate(null).ok, false);
      assert.strictEqual(itsa.number().validate(undefined).ok, false);
      assert.strictEqual(itsa.number().validate(new Date()).ok, false);
    });
  });
});
