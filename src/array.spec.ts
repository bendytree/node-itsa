
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('array', function() {

    it('any non array is invalid', function() {
      assert.strictEqual(itsa().array().validate(null).ok, false);
      assert.strictEqual(itsa().array().validate(undefined).ok, false);
      assert.strictEqual(itsa().array().validate({}).ok, false);
      assert.strictEqual(itsa().array().validate('foo').ok, false);
      assert.strictEqual(itsa().array().validate(/x/).ok, false);
    });

    it('no example means any array is fine', function() {
      assert.strictEqual(itsa().array().validate([]).ok, true);
      assert.strictEqual(itsa().array().validate([1]).ok, true);
      assert.strictEqual(itsa().array().validate([null, {}, [], 3]).ok, true);
    });

    it('validates example schema', function() {
      assert.strictEqual(itsa().array(itsa().number()).validate([1, 2, 3]).ok, true);
      assert.strictEqual(itsa().array(itsa().object()).validate([{foo: 'bar'}, {x: 'z'}]).ok, true);
      assert.strictEqual(itsa().array(itsa().object({a:itsa().number()})).validate([{a:1}]).ok, true);
    });

    it('empty always validates example schema', function() {
      assert.strictEqual(itsa().array(itsa().number()).validate([]).ok, true);
      assert.strictEqual(itsa().array(itsa().object()).validate([]).ok, true);
      assert.strictEqual(itsa().array(itsa().object({a:itsa().number()})).validate([]).ok, true);
    });

    it('invalidates example schema', function() {
      assert.strictEqual(itsa().array(itsa().number()).validate([1, 2, null]).ok, false);
      assert.strictEqual(itsa().array(itsa().object()).validate(['hi', {x: 'z'}]).ok, false);
      assert.strictEqual(itsa().array(itsa().object({a:itsa().number()})).validate([4, {a:1}]).ok, false);
    });

  });
});
