
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('instanceof', function() {
    it('validates classes', function() {
      assert.strictEqual(itsa().instanceof(Date).validate(new Date()).ok, true);
      assert.strictEqual(itsa().instanceof(RegExp).validate(new RegExp('foo')).ok, true);
      assert.strictEqual(itsa().instanceof(Function).validate(() => { }).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa().instanceof(String).validate("foo").ok, false);
      assert.strictEqual(itsa().instanceof(Number).validate(23.43).ok, false);
      assert.strictEqual(itsa().instanceof(Date).validate('foo').ok, false);
      assert.strictEqual(itsa().instanceof(String).validate(new Date()).ok, false);
      assert.strictEqual(itsa().instanceof(Number).validate(true).ok, false);
      assert.strictEqual(itsa().instanceof(RegExp).validate(23.43).ok, false);
    });
  });
});
