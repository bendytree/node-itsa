
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

    it('does nothing if root is not an object schema with an example', function() {
      const obj = {};
      itsa.object().touch(obj);
      assert.strictEqual(Object.keys(obj).length, 0);
    });

    it('does nothing if given value is not an object', function() {
      const result = itsa.object({}).touch(null);
      assert.strictEqual(result, null);
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

    it('a custom touching function can be used', function() {
      const schema = itsa.object({
        x: itsa.string(),
        y: itsa.string(),
        z: itsa.string(),
      });
      const obj = { x:'foo' } as any;
      schema.touch(obj, (key, obj) => obj[key] = 'bar');
      assert.strictEqual(Object.keys(obj).length, 3);
      assert.strictEqual(obj.x, 'foo');
      assert.strictEqual(obj.y, 'bar');
      assert.strictEqual(obj.z, 'bar');
    });

    it('keys can be pulled directly', function() {
      const schema = itsa.object({
        x: itsa.string(),
        y: itsa.optional(itsa.any(Number, String)),
        z: itsa.anything(),
      });
      assert.strictEqual(schema.keys().join(','), 'x,y,z');
    });

    it('ignores optional root object', function() {
      const schema = itsa.optional(itsa.object({ x: itsa.string() }));
      assert.strictEqual(schema.keys().join(','), 'x');
    });

    it('another object can be picked directly', function() {
      const schema = itsa.object({
        x: itsa.string(),
        y: itsa.optional(itsa.any(Number, String)),
        z: itsa.anything(),
      });
      const picked = schema.pick({
        a: 1,
        x: 2,
        y: undefined,
      });
      assert.strictEqual(Object.keys(picked).length, 2);
      assert.strictEqual(Object.keys(picked).join(','), 'x,y');
      assert.strictEqual(picked.x, 2);
      assert.strictEqual(picked.y, undefined);
    });

  });

});
