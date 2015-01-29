
var assert = require("chai").assert;
var itsa = require('../index');

describe('null', function(){

  it('identifies valid', function(){
    var values = [
      null
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.null().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      undefined,
      "",
      0,
      false,
      NaN
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.null().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
