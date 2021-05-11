
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('not-empty', function() {
    it('validates non empty', function() {
      assert.strictEqual(itsa().notEmpty().validate([4]).ok, true);
      assert.strictEqual(itsa().notEmpty().validate({ foo: 'bar' }).ok, true);
      assert.strictEqual(itsa().notEmpty().validate('red').ok, true);
    });

    it('invalidates empty', function() {
      assert.strictEqual(itsa().notEmpty().validate([]).ok, false);
      assert.strictEqual(itsa().notEmpty().validate({ }).ok, false);
      assert.strictEqual(itsa().notEmpty().validate('').ok, false);
      assert.strictEqual(itsa().notEmpty().validate(4).ok, false);
      assert.strictEqual(itsa().notEmpty().validate(true).ok, false);
      assert.strictEqual(itsa().notEmpty().validate(null).ok, false);
      assert.strictEqual(itsa().notEmpty().validate(false).ok, false);
      assert.strictEqual(itsa().notEmpty().validate(undefined).ok, false);
    });
  });
});
