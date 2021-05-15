
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('length', function() {
    it('validates length > 0', function() {
      assert.strictEqual(itsa.length().validate([6]).ok, true);
      assert.strictEqual(itsa.length().validate(['foo', 'bar']).ok, true);
      assert.strictEqual(itsa.length().validate('foobar').ok, true);
    });

    it('invalidates length > 0', function() {
      assert.strictEqual(itsa.length().validate([]).ok, false);
      assert.strictEqual(itsa.length().validate('').ok, false);
      assert.strictEqual(itsa.length().validate(null).ok, false);
      assert.strictEqual(itsa.length().validate(true).ok, false);
      assert.strictEqual(itsa.length().validate(undefined).ok, false);
    });

    it('validates exact length', function() {
      assert.strictEqual(itsa.length(0).validate([]).ok, true);
      assert.strictEqual(itsa.length(1).validate(['foo']).ok, true);
      assert.strictEqual(itsa.length(2).validate([3, 4]).ok, true);
      assert.strictEqual(itsa.length(5).validate({ length: 5 }).ok, true);
      assert.strictEqual(itsa.length(6).validate('foobar').ok, true);
    });

    it('invalidates exact length', function() {
      assert.strictEqual(itsa.length(1).validate([]).ok, false);
      assert.strictEqual(itsa.length(0).validate(['foo']).ok, false);
      assert.strictEqual(itsa.length(1).validate([3, 4]).ok, false);
      assert.strictEqual(itsa.length(9).validate({ length: 5 }).ok, false);
      assert.strictEqual(itsa.length(8).validate({ length: 'foobar' }).ok, false);
    });

    it('validates length range', function() {
      assert.strictEqual(itsa.length(1, 3).validate([8]).ok, true);
      assert.strictEqual(itsa.length(1, 3).validate([8, 8]).ok, true);
      assert.strictEqual(itsa.length(1, 3).validate([8, 8, 8]).ok, true);
      assert.strictEqual(itsa.length(1, 5).validate('foo').ok, true);
    });

    it('invalidates length range', function() {
      assert.strictEqual(itsa.length(1, 3).validate([]).ok, false);
      assert.strictEqual(itsa.length(1, 3).validate([8, 8, 8, 8]).ok, false);
      assert.strictEqual(itsa.length(1, 5).validate('').ok, false);
      assert.strictEqual(itsa.length(1, 5).validate('foobar').ok, false);
    });
  });
});
