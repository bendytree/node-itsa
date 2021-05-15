
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('function', function() {

    it('validates', function() {
      assert.strictEqual(itsa.function().validate(() => {}).ok, true);
      assert.strictEqual(itsa.function().validate(function(){}).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa.function().validate(false).ok, false);
      assert.strictEqual(itsa.function().validate(0).ok, false);
      assert.strictEqual(itsa.function().validate('').ok, false);
      assert.strictEqual(itsa.function().validate(null).ok, false);
      assert.strictEqual(itsa.function().validate(undefined).ok, false);
      assert.strictEqual(itsa.function().validate(true).ok, false);
      assert.strictEqual(itsa.function().validate(1).ok, false);
      assert.strictEqual(itsa.function().validate([]).ok, false);
      assert.strictEqual(itsa.function().validate({}).ok, false);
    });

    it('validates argument length', function() {
      assert.strictEqual(itsa.function({ length: itsa.equal(0) }).validate(() => {}).ok, true);
      assert.strictEqual(itsa.function({ length: itsa.equal(1) }).validate(x => x).ok, true);
    });

    it('invalidates argument length', function() {
      assert.strictEqual(itsa.function({ length: itsa.equal(1) }).validate(() => {}).ok, false);
      assert.strictEqual(itsa.function({ length: itsa.equal(2) }).validate(() => {}).ok, false);
    });

  });

});
