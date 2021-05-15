
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('between', function() {

    it('validates numbers', function() {
      assert.strictEqual(itsa.between(-5, 5).validate(0).ok, true);
      assert.strictEqual(itsa.between(5, 35).validate(7).ok, true);
    });

    it('validates strings', function() {
      assert.strictEqual(itsa.between('a', 'c').validate('b').ok, true);
    });

    it('validates dates', function() {
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1500000000000)).validate(new Date(1400000000000)).ok, true);
    });

    it('invalidates numbers', function() {
      assert.strictEqual(itsa.between(-5, 5).validate(-20).ok, false);
      assert.strictEqual(itsa.between(5, 35).validate(40).ok, false);
    });

    it('invalidates strings', function() {
      assert.strictEqual(itsa.between('b', 'c').validate('a').ok, false);
    });

    it('invalidates dates', function() {
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1400000000000)).validate(new Date(1500000000000)).ok, false);
    });

    it('is inclusive by default', function() {
      assert.strictEqual(itsa.between(1, 5).validate(1).ok, true);
      assert.strictEqual(itsa.between(1, 5).validate(5).ok, true);
      assert.strictEqual(itsa.between('a', 'c').validate('a').ok, true);
      assert.strictEqual(itsa.between('a', 'c').validate('c').ok, true);
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1400000000000)).validate(new Date(1300000000000)).ok, true);
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1400000000000)).validate(new Date(1400000000000)).ok, true);
    });

    it('can be made non-inclusive', function() {
      assert.strictEqual(itsa.between(1, 5, { inclusive: false }).validate(1).ok, false);
      assert.strictEqual(itsa.between(1, 5, { inclusive: false }).validate(5).ok, false);
      assert.strictEqual(itsa.between('a', 'c', { inclusive: false }).validate('a').ok, false);
      assert.strictEqual(itsa.between('a', 'c', { inclusive: false }).validate('c').ok, false);
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1400000000000), { inclusive: false }).validate(new Date(1300000000000)).ok, false);
      assert.strictEqual(itsa.between(new Date(1300000000000), new Date(1400000000000), { inclusive: false }).validate(new Date(1400000000000)).ok, false);
    });

  });
});
