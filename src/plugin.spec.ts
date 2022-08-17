
import { describe, it } from 'mocha';
import {Itsa, itsa, ItsaValidateContext} from "./itsa";
import assert from "assert";

class ItsaBird {
  bird(this:Itsa):Itsa{
    this.predicates.push({ id:'bird' });
    return this;
  }
}

declare module './itsa' {
  interface Itsa extends ItsaBird { }
}

describe('itsa', function() {
  describe('plugin', function() {

    it('can be extended with typescript', function() {
      Itsa.extend(ItsaBird, {
        id: 'bird',
        validate({ val, result }:ItsaValidateContext) {
          const isBird = ['dove','bluejay','crow'].includes(val);
          if (!isBird) result.registerError(`Not a bird`, val);
        }
      });

      assert.strictEqual(itsa.bird().validate('crow').ok, true);
      assert.strictEqual(itsa.bird().validate('fox').ok, false);
    });

    it('can be extended with javascript', function() {
      class ItsaFish {
        fish(this:Itsa):Itsa{
          this.predicates.push({ id:'fish' });
          return this;
        }
      }

      Itsa.extend(ItsaFish, {
        id: 'fish',
        validate({ val, result }:ItsaValidateContext) {
          const isFish = ['minnow', 'salmon', 'goldfish'].includes(val);
          if (!isFish) result.registerError(`Not a fish`, val);
        }
      });

      // @ts-ignore
      assert.strictEqual(itsa.fish().validate('salmon').ok, true);
      // @ts-ignore
      assert.strictEqual(itsa.fish().validate('frog').ok, false);
    });

  });
});
