
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('truthy', function() {

    it('validates', function() {
      assert.strictEqual(itsa().truthy().validate(true).ok, true);
      assert.strictEqual(itsa().truthy().validate(1).ok, true);
      assert.strictEqual(itsa().truthy().validate([]).ok, true);
      assert.strictEqual(itsa().truthy().validate({}).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().truthy().validate(false).ok, false);
      assert.strictEqual(itsa().truthy().validate(0).ok, false);
      assert.strictEqual(itsa().truthy().validate('').ok, false);
      assert.strictEqual(itsa().truthy().validate(null).ok, false);
      assert.strictEqual(itsa().truthy().validate(undefined).ok, false);
    });

  });

});
