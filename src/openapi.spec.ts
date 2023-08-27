
import { describe, it } from 'mocha';
import {itsa, Itsa} from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('creates openapi v3 schemas', function() {

    it('string', function() {
      const schema = itsa.string().toOpenApiSchema();
      assert.deepStrictEqual(schema, { type: 'string' });
    });

    it('object', function() {
      const schema = itsa.object({
        id: itsa.string(),
      }).toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      });
    });

    it('object with optional', function() {
      const schema = itsa.object({
        id: itsa.string(),
        name: itsa.optional(itsa.string()),
      }).toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      });
    });

    it('array - anything', function() {
      assert.deepStrictEqual(
        itsa.array().toOpenApiSchema(),
        { type: 'array' },
      );
    });

    it('array - numbers', function() {
      assert.deepStrictEqual(
        itsa.array(itsa.number()).toOpenApiSchema(),
        { type: 'array', items: { type: 'number' } },
      );
    });

    it('number', function() {
      assert.deepStrictEqual(
        itsa.number().between(5, 10).toOpenApiSchema(),
        { type: 'number', minimum: 5, maximum: 10 },
      );
    });

    it('email', function() {
      assert.deepStrictEqual(
        itsa.string().email().notEmpty().toOpenApiSchema(),
        { type: 'string', format: 'email', minLength: 1 },
      );
    });

    it('any - mixed', function() {
      assert.deepStrictEqual(
        itsa.any('foo', 5).toOpenApiSchema(),
        { oneOf: [{ type: 'string', const: 'foo' }, { type: 'integer', const: 5 }] },
      );
    });

    it('enum - strings', function() {
      assert.deepStrictEqual(
        itsa.any('foo', 'bar').toOpenApiSchema(),
        { type: 'string', enum: ['foo', 'bar'] },
      );
    });

    it('enum - numbers', function() {
      assert.deepStrictEqual(
        itsa.any(5, 23).toOpenApiSchema(),
        { type: 'integer', enum: [5, 23] },
      );
    });
  });


  describe('creates schemas with meta', function() {

    it('string - everything', function() {
      const schema = itsa.string().schema({
        description: 'foo',
        default: 'b',
        example: 'c',
        title: 'd',
      }).toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'string',
        description: 'foo',
        default: 'b',
        example: 'c',
        title: 'd',
      });
    });

    it('string - last in wins', function() {
      const schema = itsa.string()
        .schema({ description: 'a', title: 'c' })
        .schema({ description: 'b' })
        .toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'string',
        description: 'b',
        title: 'c',
      });
    });

    it('object', function() {
      const schema = itsa
        .object({ id: itsa.string().schema({ title: 'b' }) })
        .schema({ description: 'a' })
        .toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'object',
        description: 'a',
        required: ['id'],
        properties: {
          id: { type: 'string', title: 'b' },
        },
      });
    });

    it('array', function() {
      const schema = itsa
        .array(itsa.object({ id: itsa.string().schema({ title: 'b' }) }).schema({ description: 'c' }))
        .schema({ description: 'a' })
        .toOpenApiSchema();
      assert.deepStrictEqual(schema, {
        type: 'array',
        description: 'a',
        items: {
          type: 'object',
          required: ['id'],
          description: 'c',
          properties: {
            id: { type: 'string', title: 'b' },
          }
        },
      });
    });

    it('string - defaults doesnt override existing value', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ description: 'a' })
          .schema({ _defaults: { description: 'b' }})
          .toOpenApiSchema(), {
        type: 'string',
        description: 'a'
      });
    });

    it('string - defaults overrides omitted', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ })
          .schema({ _defaults: { description: 'b' }})
          .toOpenApiSchema(), {
          type: 'string',
          description: 'b'
        });
    });

    it('string - defaults overrides null', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ description: null })
          .schema({ _defaults: { description: 'b' }})
          .toOpenApiSchema(), {
          type: 'string',
          description: 'b'
        });
    });

    it('string - defaults overrides undefined', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ description: undefined })
          .schema({ _defaults: { description: 'b' }})
          .toOpenApiSchema(), {
          type: 'string',
          description: 'b'
        });
    });

    it('string - first default wins', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ description: undefined })
          .schema({ _defaults: { description: 'a' }})
          .schema({ _defaults: { description: 'b' }})
          .toOpenApiSchema(), {
          type: 'string',
          description: 'a'
        });
    });

    it('string - default gets overridden by normal', function() {
      assert.deepStrictEqual(
        itsa.string()
          .schema({ description: null })
          .schema({ _defaults: { description: 'a' }})
          .schema({ description: 'c' })
          .toOpenApiSchema(), {
          type: 'string',
          description: 'c'
        });
    });

    it('supports referenced schemas', function() {
      const itsaUser = itsa.schema({ title: 'User' }).object({
        name: itsa.string(),
        pet: itsa.schema({ title: 'Pet' }).object({
          type: itsa.any('dog', 'cat'),
        }),
      });
      const $refs = {};
      const userSchema = itsaUser.toOpenApiSchema({
        toRef (schema:any):string | null {
          if (schema.title) { $refs[`/${schema.title}`] = schema; }
          return schema.title ? `/${schema.title}` : null;
        }
      });
      assert.deepStrictEqual(
        userSchema,
        {
          type: 'object',
          title: 'User',
          required: ['name', 'pet'],
          properties: {
            name: { type: 'string' },
            pet: { $ref: '/Pet' },
          },
        },
      );
      assert.deepStrictEqual(
        $refs,
        {
          '/Pet': {
            type: 'object',
            title: 'Pet',
            required: ['type'],
            properties: {
              type: { type: 'string', enum: ['dog', 'cat'] },
            },
          },
          '/User': {
            type: 'object',
            title: 'User',
            required: ['name', 'pet'],
            properties: {
              name: { type: 'string' },
              pet: { $ref: '/Pet' },
            },
          }
        }
      );
    });

  });
});
