
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('unique', function() {

    it('validates', function() {
      assert.strictEqual(itsa().unique().validate([]).ok, true);
      assert.strictEqual(itsa().unique().validate([1, 2, 3]).ok, true);
      assert.strictEqual(itsa().unique().validate(['2', 2]).ok, true);
      assert.strictEqual(itsa().unique().validate(['a', 'b']).ok, true);
      assert.strictEqual(itsa().unique().validate({ a: 1, b: 2 }).ok, true);
      assert.strictEqual(itsa().unique().validate('xyz').ok, true);
    });

    it('validates with getter', function() {
      assert.strictEqual(itsa().unique(o => o.id).validate([{ id: 1 }, { id: 2 }]).ok, true);
      assert.strictEqual(itsa().unique(o => o.id).validate({ a: { id: 1 }, b: { id: 2 } }).ok, true);
      assert.strictEqual(itsa().unique(o => Math.random()).validate('2222').ok, true);
    });

    it('invalidates with getter', function() {
      assert.strictEqual(itsa().unique(o => o.id).validate([{ id: 1 }, { id: 1 }]).ok, false);
      assert.strictEqual(itsa().unique(o => o.id).validate({ a: { id: 1 }, b: { id: 1 } }).ok, false);
      assert.strictEqual(itsa().unique(o => parseInt(o) % 2).validate('123').ok, false);
    });

    it('ignored primitives', function() {
      assert.strictEqual(itsa().unique().validate(null).ok, true);
      assert.strictEqual(itsa().unique().validate(undefined).ok, true);
      assert.strictEqual(itsa().unique().validate(true).ok, true);
      assert.strictEqual(itsa().unique().validate(23).ok, true);
      assert.strictEqual(itsa().unique().validate(new Date()).ok, true);
      assert.strictEqual(itsa().unique().validate(/x/).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().unique().validate([2, 2, 3]).ok, false);
      assert.strictEqual(itsa().unique().validate(['b', 'c', 'b']).ok, false);
      assert.strictEqual(itsa().unique().validate('xyy').ok, false);
    });

  });

});
