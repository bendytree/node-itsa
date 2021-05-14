
import { describe, it } from 'mocha';
import { itsa } from "./index";
import assert from "assert";

describe('itsa', function() {
  describe('equal', function() {
    it('validates strictly equal', function() {
      assert.strictEqual(itsa.equal(1).validate(1).ok, true);
      assert.strictEqual(itsa.equal('').validate('').ok, true);
      assert.strictEqual(itsa.equal(null).validate(null).ok, true);
      assert.strictEqual(itsa.equal(undefined).validate(undefined).ok, true);
      assert.strictEqual(itsa.equal(false).validate(false).ok, true);
    });

    it('invalidates coherced equal', function() {
      assert.strictEqual(itsa.equal(1).validate('1').ok, false);
      assert.strictEqual(itsa.equal('1').validate(1).ok, false);
      assert.strictEqual(itsa.equal(0).validate(null).ok, false);
      assert.strictEqual(itsa.equal(null).validate(false).ok, false);
      assert.strictEqual(itsa.equal(undefined).validate(null).ok, false);
    });

    it('strict is the default', function() {
      assert.strictEqual(itsa.equal(0).validate('0').ok, false);
      assert.strictEqual(itsa.equal(0, undefined).validate('0').ok, false);
      assert.strictEqual(itsa.equal(0, { strict: true }).validate('0').ok, false);
      assert.strictEqual(itsa.equal(0, { strict: false }).validate('0').ok, true);
      // @ts-ignore
      assert.strictEqual(itsa.equal(0, { strict: 0 }).validate('0').ok, true);
      // @ts-ignore
      assert.strictEqual(itsa.equal(0, { strict: 1 }).validate('0').ok, false);
    });

    it('validates coherced equal with strict disabled', function() {
      assert.strictEqual(itsa.equal(1, { strict: false }).validate('1').ok, true);
      assert.strictEqual(itsa.equal('1', { strict: false }).validate(1).ok, true);
      assert.strictEqual(itsa.equal(null, { strict: false }).validate(undefined).ok, true);
      assert.strictEqual(itsa.equal(undefined, { strict: false }).validate(null).ok, true);
    });
  });
});
