
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('email', function() {
    it('validates good emails', function() {
      assert.strictEqual(itsa.email().validate('bob@example.com').ok, true);
      assert.strictEqual(itsa.email().validate('bob@Example.COM').ok, true);
      assert.strictEqual(itsa.email().validate('bob.a-b@e.x-_ample.co').ok, true);
    });

    it('invalidates bad emails', function() {
      assert.strictEqual(itsa.email().validate(' bob@example.com').ok, false);
      assert.strictEqual(itsa.email().validate('bob@example.com ').ok, false);
      assert.strictEqual(itsa.email().validate('Bob <bob@example.com>').ok, false);
      assert.strictEqual(itsa.email().validate('bob.example.com').ok, false);
      assert.strictEqual(itsa.email().validate('').ok, false);
    });

    it('invalidates anything else', function() {
      assert.strictEqual(itsa.email().validate(0).ok, false);
      assert.strictEqual(itsa.email().validate(Date.now()).ok, false);
      assert.strictEqual(itsa.email().validate(true).ok, false);
      assert.strictEqual(itsa.email().validate(false).ok, false);
      assert.strictEqual(itsa.email().validate(null).ok, false);
      assert.strictEqual(itsa.email().validate(undefined).ok, false);
      assert.strictEqual(itsa.email().validate({}).ok, false);
      assert.strictEqual(itsa.email().validate(/s/).ok, false);
    });
  });
});
