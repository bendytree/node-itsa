
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./itsa";

describe('itsa', function() {
  describe('serialize', function() {

    it('uses toJSON to serialize', function() {
      const json = JSON.stringify(itsa.object({
        id: itsa.number().min(1024),
        type: itsa.any('red', 'blue', itsa.null()),
        values: itsa.array(itsa.boolean()).notEmpty(),
      }));
      const expected = `{"predicates":[{"id":"object","settings":{"example":{"id":{"predicates":[{"id":"number"},{"id":"min","settings":{"min":1024,"inclusive":true}}]},"type":{"predicates":[{"id":"any","settings":{"schemas":[{"predicates":[{"id":"equal","settings":{"example":"red"}}]},{"predicates":[{"id":"equal","settings":{"example":"blue"}}]},{"predicates":[{"id":"equal","settings":{"example":null,"strict":true}}]}]}}]},"values":{"predicates":[{"id":"array","settings":{"example":{"predicates":[{"id":"boolean","settings":null}]}}},{"id":"notEmpty","settings":null}]}},"config":{}}}]}`;
      assert.strictEqual(json, expected);
    });

    it('offers toJSON', function() {
      const json = JSON.stringify(itsa.object({
        id: itsa.number().min(1024),
        type: itsa.any('red', 'blue', itsa.null()),
        values: itsa.array(itsa.boolean()).notEmpty(),
      }).toJSON());
      const expected = `{"predicates":[{"id":"object","settings":{"example":{"id":{"predicates":[{"id":"number"},{"id":"min","settings":{"min":1024,"inclusive":true}}]},"type":{"predicates":[{"id":"any","settings":{"schemas":[{"predicates":[{"id":"equal","settings":{"example":"red"}}]},{"predicates":[{"id":"equal","settings":{"example":"blue"}}]},{"predicates":[{"id":"equal","settings":{"example":null,"strict":true}}]}]}}]},"values":{"predicates":[{"id":"array","settings":{"example":{"predicates":[{"id":"boolean","settings":null}]}}},{"id":"notEmpty","settings":null}]}},"config":{}}}]}`;
      assert.strictEqual(json, expected);
    });

    it('deserializes back into a schema', function() {
      const schema = itsa.load({"predicates":[{"id":"object","settings":{"example":{"id":{"predicates":[{"id":"number","settings":null},{"id":"min","settings":{"min":1024,"inclusive":true}}]},"type":{"predicates":[{"id":"any","settings":{"schemas":[{"predicates":[{"id":"equal","settings":{"example":"red"}}]},{"predicates":[{"id":"equal","settings":{"example":"blue"}}]},{"predicates":[{"id":"equal","settings":{"example":null,"strict":true}}]}]}}]},"values":{"predicates":[{"id":"array","settings":{"example":{"predicates":[{"id":"boolean","settings":null}]}}},{"id":"notEmpty","settings":null}]}},"config":{}}}]});
      const result = schema.validate({
        id:2000,
        type: 'blue',
        values: ['?'],
      });
      assert.strictEqual(result.ok, false);
      assert.strictEqual(result.errors.length, 1);
      assert.strictEqual(result.errors[0].key, 0);
      assert.strictEqual(result.errors[0].path.join(','), 'values,0');
    });

  });

});
