
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('message', function() {
    it('original message still works', function() {
      assert.strictEqual(itsa.max(1).validate('Foo').message, 'Value must be at most 1');
      assert.strictEqual(itsa.max(1).validate(1).message, undefined);
    });

    it('can customize error messages', function() {
      assert.strictEqual(itsa.max(1).message('foo').validate('Foo').message, 'foo');
    });

    it('customize error message is applied to errors object too', function() {
      const result = itsa.max(1).message('foo').validate('Foo');
      assert.strictEqual(result.errors.length, 1, 'Should have 1 error');
      assert.strictEqual(result.errors[0].message, 'foo', 'Message should be foo.');
    });

    it('can customize error messages per validation', function() {
      const schema = itsa.string().message('foo').matches(/cat/).message('bar');
      assert.strictEqual(schema.validate(7).message, 'foo');
      assert.strictEqual(schema.validate('bunny').message, 'bar');
    });

    it('valid data message is not changed', function() {
      assert.strictEqual(itsa.max(1).message('foo').validate(1).message, undefined);
    });

    it('can use msg for short hand', function() {
      assert.strictEqual(itsa.max(1).msg('foo').validate('Foo').message, 'foo');
    });

    it('can use format string to include original error message', function() {
      assert.strictEqual(itsa.max(1).msg('Foo Bar {message}').validate('Foo').message, 'Foo Bar Value must be at most 1');
      assert.strictEqual(itsa.max(1).msg('Foo Bar {msg}').validate('Foo').message, 'Foo Bar Value must be at most 1');
    });

    it('can use format string to include data', function() {
      const schema = itsa.max(1).msg('Foo Bar {data}');
      assert.strictEqual(schema.validate('Foo').message, 'Foo Bar "Foo"');
      assert.strictEqual(schema.validate(99).message, 'Foo Bar 99');
      assert.strictEqual(schema.validate({ a: 1}).message, 'Foo Bar {"a":1}');
    });

    it('can use format string to include path', function() {
      assert.strictEqual(itsa.object({ x: itsa.max(1).msg('foo {path}') }).validate({ x: 'bob' }).message, 'foo x');
    });
  });
});
