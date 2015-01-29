
var assert = require("chai").assert;
var itsa = require('../index');

describe('undefined', function(){

  it('identifies valid', function(){
    var values = [
      undefined
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.undefined().validate(values[i]).valid, true, String(values[i]));
    }

    assert.equal(itsa.undefined().validate().valid, true, "No argument");
  });

  it('identifies invalid', function(){
    var values = [
      null,
      "",
      0,
      false,
      NaN
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.undefined().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
