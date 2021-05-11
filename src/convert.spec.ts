
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('convert', function() {

    it('converts within an object', function() {
      const obj = { a: 3 };
      assert.strictEqual(itsa().object({a:itsa().convert(v => v * 2)}).validate(obj).ok, true);
      assert.strictEqual(obj.a, 6);
    });

    it('converts within an array', function() {
      const array = [1, 2, 3];
      assert.strictEqual(itsa().array(itsa().convert(v => v * 2)).validate(array).ok, true);
      assert.strictEqual(array.join(','), '2,4,6');
    });

    it('no return value means converting to undefined', function() {
      const obj = { a: 3 };
      assert.strictEqual(itsa().object({a:itsa().convert(v => {})}).validate(obj).ok, true);
      assert.strictEqual(obj.a, undefined);
    });

    // it('converting root entry changes return value', function() {
    //   const entry = 7;
    //   const { ok, value } = itsa().convert(v => v * 2).validate(entry);
    //   assert.strictEqual(ok, true);
    //   assert.strictEqual(entry, 7);
    //   assert.strictEqual(value, 14);
    // });

    it('no function means its ignored', function() {
      assert.strictEqual(itsa().convert(null).validate(7).ok, true);
      assert.strictEqual(itsa().convert(undefined).validate(7).ok, true);
    });

    it('no function does not change value', function() {
      const obj = { a: 3 };
      assert.strictEqual(itsa().object({a:itsa().convert(null)}).validate(obj).ok, true);
      assert.strictEqual(obj.a, 3);
    });

    it('validates by default', function() {
      assert.strictEqual(itsa().convert(v => v).validate(8).ok, true);
    });

    it('throwing is invalidating', function() {
      assert.strictEqual(itsa().convert(v => { throw 'Error' }).validate(8).ok, false);
    });

  });
});
