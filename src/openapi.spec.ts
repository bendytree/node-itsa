
import { describe, it } from 'mocha';
import { itsa } from "./itsa";
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

  });
});
