
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('validate', function() {

    it('exhaustive=false returns one error', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: false });
      assert.strictEqual(errors.length, 1);
    });

    it('exhaustive=false is the default', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { errors } = schema.validate({ a:'', b:'' });
      assert.strictEqual(errors.length, 1);
    });

    it('exhaustive=true returns errors for each property', function() {
      const schema = itsa.object({ a: itsa.number(), b: itsa.number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: true });
      assert.strictEqual(errors.length, 2);
    });

    it('exhaustive=true still stops at first error for each property', function() {
      const schema = itsa.object({ a: itsa.number().above(1), b: itsa.number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: true });
      assert.strictEqual(errors.length, 2);
    });

    it('it provides keys and paths for errors', function() {
      const schema = itsa.object({ a: itsa.number().above(1), b: itsa.number() });
      const { errors } = schema.validate({ a:'', b:'' }, { exhaustive: true });
      assert.strictEqual(errors.length, 2);
      assert.strictEqual(errors[0].key, 'a');
      assert.strictEqual(JSON.stringify(errors[0].path), '["a"]');
      assert.strictEqual(typeof errors[0].message, 'string');
      assert.strictEqual(errors[1].key, 'b');
      assert.strictEqual(JSON.stringify(errors[1].path), '["b"]');
      assert.strictEqual(typeof errors[1].message, 'string');
    });

    it('it provides keys and paths for deep errors', function() {
      const schema = itsa.object({
        a: itsa.object({
          c: itsa.number()
        }),
        b: itsa.number(),
      });
      const { errors } = schema.validate({ a:{ c: 'foo' }, b:'' }, { exhaustive: true });
      assert.strictEqual(errors.length, 2);
      assert.strictEqual(errors[0].key, 'c');
      assert.strictEqual(JSON.stringify(errors[0].path), '["a","c"]');
    });

    it('it can throw an error', function() {
      try {
        itsa.number().validOrThrow('foo');
        assert.fail('This should have thrown');
      }catch(e){ }
    })

    it('it does not throw if it is valid', function() {
      try {
        itsa.number().validOrThrow(5);
      }catch(e){
        assert.fail(`This should not have thrown, but it did: ${e}`);
      }
    });

    it('the error is useful', function() {
      try {
        itsa.number().validOrThrow('foo');
        assert.fail('This should have thrown');
      }catch(e){
        assert.strictEqual(String(e), 'Error: Expected number but type is string.');
      }
    });

    it('the error is useful', function() {
      try {
        const schema = itsa.object({
          name: itsa.string().notEmpty().toTrimmed(),
          email: itsa.string().matches(/^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/),
          phone: itsa.any(null, undefined, itsa.string().matches(/^[\d]{10,12}$/)),
          pwd_hash: itsa.string(),
          pwd_date: itsa.date(),
          pwd_reset_token: itsa.any(null, undefined, itsa.string()),
          sid: itsa.string(),
        });
        const obj = {"_id":"akp4xb3k2hahczlblt","email":"joshinnorman@gmail.com","pwd_hash":"$2b$11$55ueFBbeNHfx/OdwDYQiWeVJgdpnogbKIsWnyceKVzY/MXJMCMfvC","pwd_date":new Date(),"sid":"mKIBBEScNUnAeyyfIZOsME","name":"Foo","phone":"BARs"};
        const options = {"partial":true};
        schema.validOrThrow(obj, options);
        assert.fail('This should have thrown');
      }catch(e){
        assert.strictEqual(String(e), 'WTF.');
      }
    });

  });
});
