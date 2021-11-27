
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('build', function() {
    it('works', function() {
      const schema = itsa.object({
        a: itsa.number().above(4).default(10),
        b: itsa.array(),
        c: itsa.string().default('foo'),
        d: itsa.any(null, itsa.default(99)),
      });
      assert.strictEqual(schema.build().a, 10);
      assert.strictEqual(schema.build().b, undefined);
      assert.strictEqual(schema.build().c, 'foo');
      assert.strictEqual(schema.build().d, undefined);
    });

  });

});
