
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('any', function() {
    it('no examples means always valid', function() {
      assert.strictEqual(itsa.any().validate('foo').ok, true);
      assert.strictEqual(itsa.any().validate(8).ok, true);
      assert.strictEqual(itsa.any().validate({}).ok, true);
      assert.strictEqual(itsa.any().validate([]).ok, true);
    });

    it('validates 1', function() {
      assert.strictEqual(itsa.any(itsa.number()).validate(8).ok, true);
    });

    it('invalidates 1', function() {
      assert.strictEqual(itsa.any(itsa.number()).validate('foo').ok, false);
    });

    it('validates 2', function() {
      assert.strictEqual(itsa.any(itsa.object(), itsa.number()).validate(8).ok, true);
    });

    it('invalidates 2', function() {
      assert.strictEqual(itsa.any(itsa.object(), itsa.number()).validate('foo').ok, false);
    });

    it('validates first object', function() {
      const schema = itsa.any(
        itsa.object({a:itsa.number()}),
        itsa.object({b:itsa.number()}),
      );
      assert.strictEqual(schema.validate({b:8}).ok, true);
    });

    it('validates second object', function() {
      const schema = itsa.any(
        itsa.object({a:itsa.number()}),
        itsa.object({b:itsa.number()}),
      );
      assert.strictEqual(schema.validate({b:8}).ok, true);
    });

    it('invalidates objects', function() {
      const schema = itsa.any(
        itsa.object({a:itsa.number()}),
        itsa.object({b:itsa.number()}),
      );
      assert.strictEqual(schema.validate({c:8}).ok, false);
    });

    it('also takes an array', function() {
      assert.strictEqual(itsa.any([itsa.number(), itsa.boolean()]).validate(5).ok, true);
      assert.strictEqual(itsa.any([itsa.number(), itsa.boolean()]).validate('red').ok, false);
    });
  });
});
