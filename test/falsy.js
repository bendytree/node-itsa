
var assert = require("chai").assert;
var itsa = require('../index');

describe('false', function(){

  it('identifies valid', function(){
    var values = [
      false,
      0,
      NaN,
      undefined,
      null
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.falsy().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      true,
      1,
      "red",
      []
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.falsy().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
