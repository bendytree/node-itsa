
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('and', function() {
    it('schemas can be combined', function() {
      const schema = itsa.number().and(itsa.between(5, 10));
      assert.strictEqual(schema.validate(7).ok, true);
      assert.strictEqual(schema.validate(15).ok, false);
    });
  });
});
