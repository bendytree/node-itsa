
var assert = require("chai").assert;
var itsa = require('../index');

describe('error messages', function(){

  //it('uses special error messages (if given)', function(){
  //  itsa.extend({
  //    mod: function modBuilder(operand){
  //      return function modChecker(val) {
  //        var valid = val % operand === 0;
  //        return {
  //          valid: valid,
  //          logs: [this._buildLog("mod", valid?"Mod check succeeded":"Mod check failed", valid)]
  //        };
  //      };
  //    }
  //  });
  //
  //  assert.equal(itsa.mod(3).validate(9).valid, true, "9");
  //  assert.equal(itsa.mod(3).validate(10).valid, false, "9");
  //});

});
