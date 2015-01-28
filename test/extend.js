
var assert = require("chai").assert;
var itsa = require('../index');

describe('extend', function(){

  it('expects a hash where the value is a builder function', function(){
    itsa.extend({
      mod: function modBuilder(operand){
        return function modChecker(val) {
          var valid = val % operand === 0;
          return {
            valid: valid,
            logs: [this._buildLog("mod", valid?"Mod check succeeded":"Mod check failed", valid)]
          };
        };
      }
    });

    assert.equal(itsa.mod(3).validate(9).valid, true, "9");
    assert.equal(itsa.mod(3).validate(10).valid, false, "9");
  });

  it('checker function can return `custom` style boolean', function(){
    itsa.extend({
      mod: function modBuilder(operand){
        return function modChecker(val) {
          return val % operand === 0;
        };
      }
    });

    assert.equal(itsa.mod(3).validate(9).valid, true, "9");
    assert.equal(itsa.mod(3).validate(10).valid, false, "9");
  });

  it('checker function can return `custom` style null|"Error Message"', function(){
    itsa.extend({
      mod: function modBuilder(operand){
        return function modChecker(val) {
          var result = val % operand;
          var errorMessage = result === 0 ? null : val+" % "+operand+" is "+result+", not 0.";
          return errorMessage;
        };
      }
    });

    assert.equal(itsa.mod(3).validate(9).valid, true, "9");
    assert.equal(itsa.mod(3).validate(10).valid, false, "10");
    assert.equal(itsa.mod(3).validate(10).describe(), "10 % 3 is 1, not 0.", "10 description");
  });

});
