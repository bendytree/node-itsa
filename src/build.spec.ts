
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa, itsaField, ItsaSchema, itsaSchema } from "./itsa";


@itsaSchema()
class IDog extends ItsaSchema {
  @itsaField(itsa.number().default(4))
  legs:number;
}

@itsaSchema()
class IUser extends ItsaSchema {
  @itsaField(itsa.string().default('Sunny'))
  name:string;
  @itsaField(IDog.schema)
  dog:IDog;
}

describe('itsa', function() {
  describe('build', function() {
    it('creates an object using defaulted values', function() {
      const schema = itsa.object({
        a: itsa.number().above(4).default(10),
        b: itsa.array(),
        c: itsa.string().default('foo'),
        d: itsa.any(null, itsa.default(99)),
      });
      assert.strictEqual(schema.build().a, 10);
      assert.strictEqual(JSON.stringify(schema.build().b), '[]');
      assert.strictEqual(schema.build().c, 'foo');
      assert.strictEqual(schema.build().d, undefined);
    });

    it('applies defaults for attributed constructors', function() {
      const user = new IUser();
      assert.strictEqual(user.name, 'Sunny');
    });

    it('creates nested schemas too', function() {
      const user = new IUser();
      assert.strictEqual(user.name, 'Sunny');
      assert.strictEqual(user.dog.legs, 4);
      assert.strictEqual(JSON.stringify(user), `{"name":"Sunny","dog":{"legs":4}}`);
    });

    it('initializes sub objects', function() {
      const schema = itsa.object({
        foo: itsa.object(),
      });
      assert.strictEqual(JSON.stringify(schema.build()), `{"foo":{}}`);
    });

    it('initializes sub arrays', function() {
      const schema = itsa.object({
        foo: itsa.array(),
      });
      assert.strictEqual(JSON.stringify(schema.build()), `{"foo":[]}`);
    });

    it('does not use defaults inside of an `any` clause', function() {
      const schema = itsa.object({
        foo: itsa.any(itsa.object()),
      });
      assert.strictEqual(JSON.stringify(schema.build()), `{}`);
    });

    it('assigns overrides', function() {
      const schema = itsa.object({
        a: itsa.object(),
        b: itsa.array(),
        c: itsa.default('foo'),
      });
      const obj = schema.build({
        b:[1],
        c: 'bar',
        d: 'z',
      });
      assert.strictEqual(JSON.stringify(obj), `{"a":{},"b":[1],"c":"bar","d":"z"}`);
    });
  });

});
