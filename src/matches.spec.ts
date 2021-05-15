
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('matches', function() {
    it('validates', function() {
      assert.strictEqual(itsa.matches(/c.t/).validate('Hi cat!').ok, true);
      assert.strictEqual(itsa.matches(/bob/i).validate('BOB WA HERE').ok, true);
    });

    it('coherces types to strings', function() {
      assert.strictEqual(itsa.matches(/true/).validate(true).ok, true);
      assert.strictEqual(itsa.matches(/99/).validate(99).ok, true);
    });

    it('invalidates', function() {
      assert.strictEqual(itsa.matches(/c.t/).validate('Hi dog!').ok, false);
      assert.strictEqual(itsa.matches(/bob/).validate('Sam WA HERE').ok, false);
      assert.strictEqual(itsa.matches(/99/).validate('987').ok, false);
    });
  });
});
