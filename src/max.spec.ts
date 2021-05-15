
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('max', function() {
    it('max validates', function() {
      assert.strictEqual(itsa.max(1).validate(1).ok, true);
      assert.strictEqual(itsa.max(9).validate(5).ok, true);
      assert.strictEqual(itsa.max('a').validate('a').ok, true);
      assert.strictEqual(itsa.max('c').validate('b').ok, true);
      assert.strictEqual(itsa.max(new Date(1222563421430)).validate(new Date(1222563421430)).ok, true);
      assert.strictEqual(itsa.max(new Date()).validate(new Date(1222563421430)).ok, true);
    });

    it('max invalidates', function() {
      assert.strictEqual(itsa.max(0).validate(1).ok, false);
      assert.strictEqual(itsa.max('b').validate('c').ok, false);
      assert.strictEqual(itsa.max(new Date(1222563421430)).validate(new Date()).ok, false);
    });

    it('under validates', function() {
      assert.strictEqual(itsa.under(6).validate(5).ok, true);
      assert.strictEqual(itsa.under('c').validate('b').ok, true);
      assert.strictEqual(itsa.under(new Date()).validate(new Date(1222563421430)).ok, true);
    });

    it('under invalidates', function() {
      assert.strictEqual(itsa.under(1).validate(1).ok, false);
      assert.strictEqual(itsa.under('a').validate('a').ok, false);
      assert.strictEqual(itsa.under(new Date(1222563421430)).validate(new Date(1222563421430)).ok, false);
      assert.strictEqual(itsa.under(1).validate(2).ok, false);
      assert.strictEqual(itsa.under('b').validate('c').ok, false);
      assert.strictEqual(itsa.under(new Date(1222563421430)).validate(new Date()).ok, false);
    });

    it('below validates', function() {
      assert.strictEqual(itsa.below(8).validate(5).ok, true);
      assert.strictEqual(itsa.below('c').validate('b').ok, true);
      assert.strictEqual(itsa.below(new Date()).validate(new Date(1222563421430)).ok, true);
    });

    it('below invalidates', function() {
      assert.strictEqual(itsa.below(1).validate(1).ok, false);
      assert.strictEqual(itsa.below('a').validate('a').ok, false);
      assert.strictEqual(itsa.below(new Date(1222563421430)).validate(new Date(1222563421430)).ok, false);
      assert.strictEqual(itsa.below(1).validate(2).ok, false);
      assert.strictEqual(itsa.below('b').validate('c').ok, false);
      assert.strictEqual(itsa.below(new Date(1222563421430)).validate(new Date()).ok, false);
    });

    it('atMost validates', function() {
      assert.strictEqual(itsa.atMost(1).validate(1).ok, true);
      assert.strictEqual(itsa.atMost(7).validate(5).ok, true);
      assert.strictEqual(itsa.atMost('a').validate('a').ok, true);
      assert.strictEqual(itsa.atMost('d').validate('b').ok, true);
      assert.strictEqual(itsa.atMost(new Date(1222563421430)).validate(new Date(1222563421430)).ok, true);
      assert.strictEqual(itsa.atMost(new Date()).validate(new Date(1222563421430)).ok, true);
    });

    it('atMost invalidates', function() {
      assert.strictEqual(itsa.atMost(1).validate(4).ok, false);
      assert.strictEqual(itsa.atMost('b').validate('d').ok, false);
      assert.strictEqual(itsa.atMost(new Date(1222563421430)).validate(new Date()).ok, false);
    });
  });
});
