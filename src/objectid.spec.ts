
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('objectid', function() {
    it('validates objectid string', function() {
      assert.strictEqual(itsa.objectid().validate('507f191e810c19729de860ea').ok, true);
      assert.strictEqual(itsa.objectid().validate('507f191e810c19729de860EA').ok, true);
    });

    it('invalidates anything else', function() {
      assert.strictEqual(itsa.objectid().validate('507f191e810c19729de860').ok, false);
      assert.strictEqual(itsa.objectid().validate('507f191e810c19729de860ZZ').ok, false);
      assert.strictEqual(itsa.objectid().validate('').ok, false);
      assert.strictEqual(itsa.objectid().validate({}).ok, false);
      assert.strictEqual(itsa.objectid().validate(null).ok, false);
      assert.strictEqual(itsa.objectid().validate(undefined).ok, false);
      assert.strictEqual(itsa.objectid().validate([]).ok, false);
      assert.strictEqual(itsa.objectid().validate(45).ok, false);
      assert.strictEqual(itsa.objectid().validate(/foo/).ok, false);
    });
  });
});
