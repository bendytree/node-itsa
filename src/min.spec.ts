
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('min', function() {
    it('min validates', function() {
      assert.strictEqual(itsa().min(1).validate(1).ok, true);
      assert.strictEqual(itsa().min(1).validate(5).ok, true);
      assert.strictEqual(itsa().min('a').validate('a').ok, true);
      assert.strictEqual(itsa().min('a').validate('b').ok, true);
      assert.strictEqual(itsa().min(new Date(1222563421430)).validate(new Date(1222563421430)).ok, true);
      assert.strictEqual(itsa().min(new Date(1222563421430)).validate(new Date()).ok, true);
    });

    it('min invalidates', function() {
      assert.strictEqual(itsa().min(1).validate(0).ok, false);
      assert.strictEqual(itsa().min('b').validate('a').ok, false);
      assert.strictEqual(itsa().min(new Date()).validate(new Date(1222563421430)).ok, false);
    });

    it('over validates', function() {
      assert.strictEqual(itsa().over(1).validate(5).ok, true);
      assert.strictEqual(itsa().over('a').validate('b').ok, true);
      assert.strictEqual(itsa().over(new Date(1222563421430)).validate(new Date()).ok, true);
    });

    it('over invalidates', function() {
      assert.strictEqual(itsa().over(1).validate(1).ok, false);
      assert.strictEqual(itsa().over('a').validate('a').ok, false);
      assert.strictEqual(itsa().over(new Date(1222563421430)).validate(new Date(1222563421430)).ok, false);
      assert.strictEqual(itsa().over(1).validate(0).ok, false);
      assert.strictEqual(itsa().over('b').validate('a').ok, false);
      assert.strictEqual(itsa().over(new Date()).validate(new Date(1222563421430)).ok, false);
    });

    it('above validates', function() {
      assert.strictEqual(itsa().above(1).validate(5).ok, true);
      assert.strictEqual(itsa().above('a').validate('b').ok, true);
      assert.strictEqual(itsa().above(new Date(1222563421430)).validate(new Date()).ok, true);
    });

    it('above invalidates', function() {
      assert.strictEqual(itsa().above(1).validate(1).ok, false);
      assert.strictEqual(itsa().above('a').validate('a').ok, false);
      assert.strictEqual(itsa().above(new Date(1222563421430)).validate(new Date(1222563421430)).ok, false);
      assert.strictEqual(itsa().above(1).validate(0).ok, false);
      assert.strictEqual(itsa().above('b').validate('a').ok, false);
      assert.strictEqual(itsa().above(new Date()).validate(new Date(1222563421430)).ok, false);
    });

    it('atLeast validates', function() {
      assert.strictEqual(itsa().atLeast(1).validate(1).ok, true);
      assert.strictEqual(itsa().atLeast(1).validate(5).ok, true);
      assert.strictEqual(itsa().atLeast('a').validate('a').ok, true);
      assert.strictEqual(itsa().atLeast('a').validate('b').ok, true);
      assert.strictEqual(itsa().atLeast(new Date(1222563421430)).validate(new Date(1222563421430)).ok, true);
      assert.strictEqual(itsa().atLeast(new Date(1222563421430)).validate(new Date()).ok, true);
    });

    it('atLeast invalidates', function() {
      assert.strictEqual(itsa().atLeast(1).validate(0).ok, false);
      assert.strictEqual(itsa().atLeast('b').validate('a').ok, false);
      assert.strictEqual(itsa().atLeast(new Date()).validate(new Date(1222563421430)).ok, false);
    });
  });
});
