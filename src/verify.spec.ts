
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('verify', function() {

    it('return true means valid', function() {
      assert.strictEqual(itsa.verify(v => true).validate(8).ok, true);
    });

    it('return false means invalid', function() {
      assert.strictEqual(itsa.verify(v => false).validate(8).ok, false);
    });

    it('return string means error', function() {
      assert.strictEqual(itsa.verify(v => 'the error message').validate(8).ok, false);
      assert.strictEqual(itsa.verify(v => 'the error message').validate(8).message, 'the error message');
    });

    it('return null means no error', function() {
      assert.strictEqual(itsa.verify(v => null).validate(8).ok, true);
    });

    it('return undefined means no error', function() {
      assert.strictEqual(itsa.verify(v => null).validate(8).ok, true);
    });

    it('return truthy means valid', function() {
      assert.strictEqual(itsa.verify(v => /x/).validate(8).ok, true);
    });

    it('value never changes', function() {
      const { value, ok } = itsa.verify(v => /x/).validate(8);
      assert.strictEqual(value, 8);
    });

    it('throw means error', function() {
      assert.strictEqual(itsa.verify(v => { throw 'foo'; }).validate(8).ok, false);
    });

    it('can verify based on parent object', function() {
      const itsaUser = itsa.object({
        username: itsa.optional(itsa.string()),
        email: itsa.optional(itsa.string()).verify((val, { parent }) => {
          return !!(parent?.email || parent?.username);
        }),
      });
      assert.strictEqual(itsaUser.validate({ email: 'foo' }).ok, true);
      assert.strictEqual(itsaUser.validate({ username: 'bar' }).ok, true);
      assert.strictEqual(itsaUser.validate({ email: 'foo', username: 'bar' }).ok, true);
      assert.strictEqual(itsaUser.validate({ name: 'John' }).ok, false);
    });

  });
});
