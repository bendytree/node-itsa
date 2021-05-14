
import { describe, it } from 'mocha';
import {Itsa, itsa, ItsaHandlerContext} from "./index";
import assert from "assert";

class ItsaBird {
  bird(this:Itsa):Itsa{
    this.actions.push({ handlerId:'bird' });
    return this;
  }
}

declare module './index' {
  interface Itsa extends ItsaBird { }
}

describe('itsa', function() {
  describe('plugin', function() {

    it('can be extended with typescript', function() {
      Itsa.extend(ItsaBird, {
        id: 'bird',
        handler({ val, result }:ItsaHandlerContext) {
          const isBird = ['dove','bluejay','crow'].includes(val);
          if (!isBird) result.addError(`Not a bird`);
        }
      });

      assert.strictEqual(itsa.bird().validate('crow').ok, true);
      assert.strictEqual(itsa.bird().validate('fox').ok, false);
    });

    it('can be extended with javascript', function() {
      class ItsaFish {
        fish(this:Itsa):Itsa{
          this.actions.push({ handlerId:'fish' });
          return this;
        }
      }

      Itsa.extend(ItsaFish, {
        id: 'fish',
        handler({ val, result }:ItsaHandlerContext) {
          const isFish = ['minnow', 'salmon', 'goldfish'].includes(val);
          if (!isFish) result.addError(`Not a fish`);
        }
      });

      assert.strictEqual(itsa.bird().validate('salmon').ok, true);
      assert.strictEqual(itsa.bird().validate('frog').ok, false);
    });

  });
});
