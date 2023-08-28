
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('clone', function() {

    it('normally itsa is mutable', function() {
      const a = itsa.string();
      const b = a.number();
      assert.strictEqual(a, b);
      assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
    });

    it('clone returns a copy', function() {
      const a = itsa.string();
      const b = a.clone().number();
      assert.notStrictEqual(a, b);
      assert.notStrictEqual(JSON.stringify(a), JSON.stringify(b));
    });

    it('clone keeps orig predicates', function() {
      assert.strictEqual(itsa.min(5).clone().number().validate(3).ok, false);
      assert.strictEqual(itsa.min(5).clone().number().validate(6).ok, true);
    });

    it('clone preserves custom functions', function() {
      assert.strictEqual(itsa.verify(v => v > 5 ? null : 'error').clone().validate(3).ok, false);
      assert.strictEqual(itsa.verify(v => v > 5 ? null : 'error').clone().validate(8).ok, true);
    });

    it('clone regex works', function() {
      assert.strictEqual(itsa.matches(/^foo$/).clone().validate('bar').ok, false);
      assert.strictEqual(itsa.matches(/^foo$/).clone().validate('foo').ok, true);
    });

    it('clone maintains optionals - isRequired', function() {
      assert.deepStrictEqual(
        itsa.optional(itsa.string()).clone().isRequired(),
        itsa.optional(itsa.string()).isRequired(),
      );
    });

    it('clone maintains optionals - toRaw', function() {
      assert.deepEqual(
        itsa.optional(itsa.string()).clone().toRaw(),
        itsa.optional(itsa.string()).toRaw(),
      );
    });

    it('clone maintains optionals - object - toRaw', function() {
      assert.deepEqual(
        itsa.object({ foo: itsa.optional(itsa.string()) }).clone().toRaw(),
        itsa.object({ foo: itsa.optional(itsa.string()) }).toRaw(),
      );
    });

  });
});
