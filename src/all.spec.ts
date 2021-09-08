
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('all', function() {
    it('all schemas can be required', function() {
      const schema = itsa.all(itsa.number(), itsa.between(5, 10));
      assert.strictEqual(schema.validate(7).ok, true);
      assert.strictEqual(schema.validate(15).ok, false);
    });
  });
});
