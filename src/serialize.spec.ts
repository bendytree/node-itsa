
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('serialize', function() {

    it('uses toJSON to serialize', function() {
      const json = JSON.stringify(itsa.object({
        id: itsa.number().min(1024),
        type: itsa.any('red', 'blue', itsa.null()),
        values: itsa.array(itsa.boolean()).notEmpty(),
      }));
      const expected = {"actions":[{"handlerId":"object","settings":{"example":{"id":{"actions":[{"handlerId":"number","settings":null},{"handlerId":"min","settings":{"min":1024,"inclusive":true}}]},"type":{"actions":[{"handlerId":"any","settings":{"schemas":[{"actions":[{"handlerId":"equal","settings":{"example":"red"}}]},{"actions":[{"handlerId":"equal","settings":{"example":"blue"}}]},{"actions":[{"handlerId":"equal","settings":{"example":null,"strict":true}}]}]}}]},"values":{"actions":[{"handlerId":"array","settings":{"example":{"actions":[{"handlerId":"boolean","settings":null}]}}},{"handlerId":"notEmpty","settings":null}]}},"config":{}}}]};
      assert.strictEqual(json, JSON.stringify(expected));
    });

    it('deserializes back into a schema', function() {
      const schema = itsa.load({"actions":[{"handlerId":"object","settings":{"example":{"id":{"actions":[{"handlerId":"number","settings":null},{"handlerId":"min","settings":{"min":1024,"inclusive":true}}]},"type":{"actions":[{"handlerId":"any","settings":{"schemas":[{"actions":[{"handlerId":"equal","settings":{"example":"red"}}]},{"actions":[{"handlerId":"equal","settings":{"example":"blue"}}]},{"actions":[{"handlerId":"equal","settings":{"example":null,"strict":true}}]}]}}]},"values":{"actions":[{"handlerId":"array","settings":{"example":{"actions":[{"handlerId":"boolean","settings":null}]}}},{"handlerId":"notEmpty","settings":null}]}},"config":{}}}]});
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
