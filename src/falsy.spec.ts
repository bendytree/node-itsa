
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('falsy', function() {

    it('validates', function() {
      assert.strictEqual(itsa.falsy().validate(false).ok, true);
      assert.strictEqual(itsa.falsy().validate(0).ok, true);
      assert.strictEqual(itsa.falsy().validate('').ok, true);
      assert.strictEqual(itsa.falsy().validate(null).ok, true);
      assert.strictEqual(itsa.falsy().validate(undefined).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa.falsy().validate(true).ok, false);
      assert.strictEqual(itsa.falsy().validate(1).ok, false);
      assert.strictEqual(itsa.falsy().validate([]).ok, false);
      assert.strictEqual(itsa.falsy().validate({}).ok, false);
    });

  });

});
