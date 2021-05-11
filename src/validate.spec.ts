
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('validate', function() {

    it('exhaustive=false returns one error', function() {
      const schema = itsa().object({ a: itsa().number(), b: itsa().number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: false });
      assert.strictEqual(errors.length, 1);
    });

    it('exhaustive=false is the default', function() {
      const schema = itsa().object({ a: itsa().number(), b: itsa().number() });
      const { errors } = schema.validate({ a:'', b:'' });
      assert.strictEqual(errors.length, 1);
    });

    it('exhaustive=true returns all errors', function() {
      const schema = itsa().object({ a: itsa().number(), b: itsa().number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: true });
      assert.strictEqual(errors.length, 2);
    });

  });
});
