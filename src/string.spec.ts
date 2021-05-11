
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('string', function() {

    it('validates', function() {
      assert.strictEqual(itsa().string().validate('').ok, true);
      assert.strictEqual(itsa().string().validate('foo').ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().string().validate(null).ok, false);
      assert.strictEqual(itsa().string().validate(undefined).ok, false);
      assert.strictEqual(itsa().string().validate(new Date()).ok, false);
      assert.strictEqual(itsa().string().validate(/f/).ok, false);
      assert.strictEqual(itsa().string().validate(23).ok, false);
      assert.strictEqual(itsa().string().validate(false).ok, false);
      assert.strictEqual(itsa().string().validate(true).ok, false);
      assert.strictEqual(itsa().string().validate({foo:'bar'}).ok, false);
      assert.strictEqual(itsa().string().validate([]).ok, false);
    });

  });

});
