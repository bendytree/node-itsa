
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

  });
});
