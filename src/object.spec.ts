
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('object', function() {

    it('validates objects', function() {
      const { ok } = itsa.object().validate({});
      assert.strictEqual(ok, true);
    });

    it('rejects null', function() {
      const { ok } = itsa.object().validate(null);
      assert.strictEqual(ok, false);
    });

    it('rejects array', function() {
      const { ok } = itsa.object().validate([]);
      assert.strictEqual(ok, false);
    });

    it('rejects numbers', function() {
      const { ok } = itsa.object().validate(0);
      assert.strictEqual(ok, false);
    });

    it('rejects regex', function() {
      const { ok } = itsa.object().validate(/./);
      assert.strictEqual(ok, false);
    });

    it('rejects regex', function() {
      const { ok } = itsa.object().validate(new Date());
      assert.strictEqual(ok, false);
    });

    it('extras are not allowed by default', function() {
      const schema = itsa.object({ a: itsa.number() });
      assert.strictEqual(schema.validate({ a:1, b:2 }).ok, false);
    });

    it('extras can be allowed allowed', function() {
      const schema = itsa.object({ a: itsa.number() }, { extras: true });
      assert.strictEqual(schema.validate({ a:1, b:2 }).ok, true);
    });

    it('partial=true allows missing fields', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { ok } = schema.validate({ a:1 }, { partial: true });
      assert.strictEqual(ok, true);
    });

    it('partial=false does not allow missing fields', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { ok } = schema.validate({ a:1 }, { partial: false });
      assert.strictEqual(ok, false);
    });

    it('partial=false is the default', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { ok } = schema.validate({ a:1 });
      assert.strictEqual(ok, false);
    });

    it('keys can be validated', function() {
      const schema = itsa.object(null, { key: itsa.email() });
      assert.strictEqual(schema.validate({ a:1 }).ok, false);
      assert.strictEqual(schema.validate({ x:5, 'd@e.com': 8 }).ok, false);
      assert.strictEqual(schema.validate({ 'a@b.com':1 }).ok, true);
      assert.strictEqual(schema.validate({ 'a@b.com':5, 'd@e.com': 8 }).ok, true);
    });

    it('values can be validated', function() {
      const schema = itsa.object(null, { value: itsa.number() });
      assert.strictEqual(schema.validate({ a:1 }).ok, true);
      assert.strictEqual(schema.validate({ a:1, b:0 }).ok, true);
      assert.strictEqual(schema.validate({ a:'red' }).ok, false);
      assert.strictEqual(schema.validate({ a:1, b:'red' }).ok, false);
    });

    it('keys, values, example can be used together', function() {
      const schema = itsa.object({ a:itsa.number() }, { value: itsa.between(1, 5) });
      assert.strictEqual(schema.validate({ a:3 }).ok, true);
    });

  });

});
