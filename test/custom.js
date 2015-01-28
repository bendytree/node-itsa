
var assert = require("chai").assert;
var itsa = require('../index');

describe('custom', function(){

  it('interprets true|false as valid|invalid', function(){
    var isMod7 = function(val){ return val%7 === 0; };
    assert.equal(itsa.custom(isMod7).validate(14).valid, true, "14");
    assert.equal(itsa.custom(isMod7).validate(11).valid, false, "11");
  });

  it('interprets null|"Error" as valid|invalid', function(){
    var getMod7ErrorMessage = function(val){ return val%7 === 0 ? null : "Value is not mod 7."; };
    assert.equal(itsa.custom(getMod7ErrorMessage).validate(14).valid, true, "14");
    assert.equal(itsa.custom(getMod7ErrorMessage).validate(11).valid, false, "11");
    assert.equal(itsa.custom(getMod7ErrorMessage).validate(11).describe(), "Value is not mod 7.", "11 - describe");
  });

  it('interprets object as real response', function(){
    var unsatisfiable = function(val){
      return { valid: false, logs: [{path:"", valid:false, message: "Better luck next time", validator:"validator"}] };
    };
    assert.equal(itsa.custom(unsatisfiable).validate("Nothing works").valid, false, "should be false");
    assert.equal(itsa.custom(unsatisfiable).validate("Nothing works").describe(), "Better luck next time", "Message should be the custom message.");
  });

});
