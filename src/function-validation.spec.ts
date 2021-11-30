
import { describe, it } from 'mocha';
import { itsa, itsaField, ItsaSchema, itsaSchema } from "./itsa";
import assert from "assert";

describe('itsa', function() {
  describe('enforce', function() {
    it('enforces function args', function() {

      @itsaSchema()
      class IFooParams extends ItsaSchema {
        @itsaField(itsa.string().notEmpty())
        name:string;
      }

      try {
        const foo = (params:IFooParams) => {
          IFooParams.schema.validOrThrow(params, { hint: 'foo()' });
          assert.fail('Exception should have been thrown');
        };
        foo({ name: '' });
      }catch(e){
        //exception is expected
      }
    });
  });
});
