
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('default', function() {
    it('changing root only changes return value', function() {
      const value = null;
      const result = itsa().default(7).validate(value);
      assert.strictEqual(result.ok, true);
      assert.strictEqual(value, null);
      assert.strictEqual(result.value, 7);
    });

    it('can set default on an object property', function() {
      const obj:any = {};
      itsa().object({ foo: itsa().default('bar') }).validate(obj);
      assert.strictEqual(obj.foo, 'bar');
    });

    it('does not set default on existing object property', function() {
      const obj:any = { foo: 'buzz' };
      itsa().object({ foo: itsa().default('bar') }).validate(obj);
      assert.strictEqual(obj.foo, 'buzz');
    });

    it('does not change falsy', function() {
      assert.strictEqual(itsa().default(7).validate(false).value, false);
      assert.strictEqual(itsa().default(7).validate(0).value, 0);
      assert.strictEqual(itsa().default(7).validate('').value, '');
    });

    it('changes null and undefined', function() {
      assert.strictEqual(itsa().default(7).validate(null).value, 7);
      assert.strictEqual(itsa().default(7).validate(undefined).value, 7);
    });

    it('changes falsy if enabled', function() {
      assert.strictEqual(itsa().default(7, { falsy: true }).validate(false).value, 7);
      assert.strictEqual(itsa().default(7, { falsy: true }).validate(0).value, 7);
      assert.strictEqual(itsa().default(7, { falsy: true }).validate('').value, 7);
    });

    it('default now does not remove data', function() {
      const obj = { created: new Date(1620594351130) };
      itsa().object({ created: itsa().defaultNow() }).validate(obj);
      assert.strictEqual(obj.created.getTime(), 1620594351130);
    });

    it('default now sets default', function() {
      const obj = { created: null };
      itsa().object({ created: itsa().defaultNow() }).validate(obj);
      assert.strictEqual(obj.created instanceof Date, true);
    });
  });
});
