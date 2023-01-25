
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('schema', function() {
    it('takes in a schema', function() {
      assert.strictEqual(itsa.schema(itsa.number()).validate(1).ok, true);
      assert.strictEqual(itsa.schema(itsa.string()).validate('foo').ok, true);
      assert.strictEqual(itsa.schema(itsa.number()).validate('foo').ok, false);
      assert.strictEqual(itsa.schema(itsa.string()).validate(1).ok, false);
    });

    it('can stack schemas', function() {
      assert.strictEqual(itsa.under(10).schema(itsa.above(5)).validate(7).ok, true, '7 should be ok');
      assert.strictEqual(itsa.under(10).schema(itsa.above(5)).validate(1).ok, false, '1 should be too low');
      assert.strictEqual(itsa.under(10).schema(itsa.above(5)).validate(20).ok, false, '20 should be too high');
    });

  });
});
