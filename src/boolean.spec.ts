
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('boolean', function() {

    it('booleans validate', function() {
      assert.strictEqual(itsa.boolean().validate(true).ok, true);
      assert.strictEqual(itsa.boolean().validate(false).ok, true);
    });

    it('non booleans fail', function() {
      assert.strictEqual(itsa.boolean().validate(0).ok, false);
      assert.strictEqual(itsa.boolean().validate(1).ok, false);
      assert.strictEqual(itsa.boolean().validate("").ok, false);
      assert.strictEqual(itsa.boolean().validate("true").ok, false);
      assert.strictEqual(itsa.boolean().validate(/true/).ok, false);
      assert.strictEqual(itsa.boolean().validate([]).ok, false);
      assert.strictEqual(itsa.boolean().validate({}).ok, false);
      assert.strictEqual(itsa.boolean().validate(null).ok, false);
      assert.strictEqual(itsa.boolean().validate(undefined).ok, false);
    });

  });
});
