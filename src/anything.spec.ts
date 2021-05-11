
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('anything', function() {
    it('validates everything', function() {
      assert.strictEqual(itsa().anything().validate('foo').ok, true);
      assert.strictEqual(itsa().anything().validate(8).ok, true);
      assert.strictEqual(itsa().anything().validate({}).ok, true);
      assert.strictEqual(itsa().anything().validate([]).ok, true);
      assert.strictEqual(itsa().anything().validate(undefined).ok, true);
      assert.strictEqual(itsa().anything().validate(null).ok, true);
      assert.strictEqual(itsa().anything().validate(0).ok, true);
    });
  });
});
