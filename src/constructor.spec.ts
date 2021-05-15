
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('constructor', function() {

    it('validates classes', function() {
      assert.strictEqual(itsa.constructorIs(String).validate('foo').ok, true);
      assert.strictEqual(itsa.constructorIs(Number).validate(1).ok, true);
      assert.strictEqual(itsa.constructorIs(Date).validate(new Date()).ok, true);
      assert.strictEqual(itsa.constructorIs(RegExp).validate(/x/).ok, true);
      assert.strictEqual(itsa.constructorIs(Object).validate({y:'z'}).ok, true);
      assert.strictEqual(itsa.constructorIs(Boolean).validate(false).ok, true);
      assert.strictEqual(itsa.constructorIs(Function).validate(() => {}).ok, true);
      assert.strictEqual(itsa.constructorIs(Array).validate([]).ok, true);
    });

    it('invalidates classes', function() {
      assert.strictEqual(itsa.constructorIs(String).validate(2).ok, false);
      assert.strictEqual(itsa.constructorIs(Number).validate('foo').ok, false);
      assert.strictEqual(itsa.constructorIs(Date).validate(/x/).ok, false);
      assert.strictEqual(itsa.constructorIs(RegExp).validate(new Date()).ok, false);
      assert.strictEqual(itsa.constructorIs(Object).validate(true).ok, false);
      assert.strictEqual(itsa.constructorIs(Boolean).validate(3).ok, false);
      assert.strictEqual(itsa.constructorIs(Function).validate({y:'z'}).ok, false);
      assert.strictEqual(itsa.constructorIs(Array).validate({}).ok, false);
    });

  });

});
