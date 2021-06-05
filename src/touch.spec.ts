
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('touch', function() {

    it('throws if root is not an object schema', function() {
      try {
        itsa.number().touch({});
        assert.fail('An exception should have been thrown');
      }catch (e){}
    });

    it('throws if root is not an object schema with an example', function() {
      try {
        itsa.object().touch({});
        assert.fail('An exception should have been thrown');
      }catch (e){}
    });

    it('throws if given value is not an object', function() {
      try {
        itsa.object({}).touch(null);
        assert.fail('An exception should have been thrown');
      }catch (e){}
    });

    it('creates an undefined value for each schema key', function() {
      const schema = itsa.object({
        a: itsa.number().above(4),
        x: itsa.array(),
        z: itsa.any(null, undefined),
      });
      const obj = {} as any;
      schema.touch(obj);
      assert.strictEqual(Object.keys(obj).join(''), 'axz');
      assert.strictEqual(Object.keys(obj).includes('a'), true);
      assert.strictEqual(Object.keys(obj).includes('x'), true);
      assert.strictEqual(Object.keys(obj).includes('z'), true);
      assert.strictEqual(obj.a, undefined);
      assert.strictEqual(obj.x, undefined);
      assert.strictEqual(obj.z, undefined);
    });

    it('does not override existing values', function() {
      const schema = itsa.object({
        a: itsa.number().above(4),
        x: itsa.string(),
      });
      const obj = { x: 'foo' } as any;
      schema.touch(obj);
      assert.strictEqual(Object.keys(obj).length, 2);
      assert.strictEqual(Object.keys(obj).includes('a'), true);
      assert.strictEqual(Object.keys(obj).includes('x'), true);
      assert.strictEqual(obj.a, undefined);
      assert.strictEqual(obj.x, 'foo');
    });

    it('can handle multiple examples', function() {
      const schema = itsa
        .object({ a: itsa.number().above(4) })
        .object({ f: itsa.string() })
        .object({ v: itsa.boolean() });
      const obj = { } as any;
      schema.touch(obj);
      assert.strictEqual(Object.keys(obj).length, 3);
      assert.strictEqual(Object.keys(obj).includes('a'), true);
      assert.strictEqual(Object.keys(obj).includes('f'), true);
      assert.strictEqual(Object.keys(obj).includes('v'), true);
    });

    it('returns the touched object for convenience', function() {
      const schema = itsa.object({ x: itsa.string() });
      const obj = { } as any;
      const result = schema.touch(obj);
      assert.strictEqual(Object.keys(obj).length, 1);
      assert.strictEqual(Object.keys(obj).includes('x'), true);
      assert.strictEqual(obj, result);
    });

  });

});
