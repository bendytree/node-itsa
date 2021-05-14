
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('typeof', function() {

    it('validates', function() {
      assert.strictEqual(itsa.typeof('boolean').validate(false).ok, true);
      assert.strictEqual(itsa.typeof('boolean').validate(true).ok, true);
      assert.strictEqual(itsa.typeof('string').validate('').ok, true);
      assert.strictEqual(itsa.typeof('string').validate('foo').ok, true);
      assert.strictEqual(itsa.typeof('number').validate(23).ok, true);
      assert.strictEqual(itsa.typeof('object').validate([]).ok, true);
      assert.strictEqual(itsa.typeof('object').validate(null).ok, true);
      assert.strictEqual(itsa.typeof('object').validate({}).ok, true);
      assert.strictEqual(itsa.typeof('object').validate(new Date()).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa.typeof('boolean').validate(878).ok, false);
      assert.strictEqual(itsa.typeof('boolean').validate(undefined).ok, false);
      assert.strictEqual(itsa.typeof('boolean').validate(null).ok, false);
      assert.strictEqual(itsa.typeof('boolean').validate('foo').ok, false);
      assert.strictEqual(itsa.typeof('string').validate(null).ok, false);
      assert.strictEqual(itsa.typeof('string').validate(87).ok, false);
      assert.strictEqual(itsa.typeof('string').validate(new Date()).ok, false);
      assert.strictEqual(itsa.typeof('object').validate(23).ok, false);
      assert.strictEqual(itsa.typeof('object').validate(false).ok, false);
      assert.strictEqual(itsa.typeof('number').validate(false).ok, false);
    });

  });

});
