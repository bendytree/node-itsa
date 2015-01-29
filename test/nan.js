
var assert = require("chai").assert;
var itsa = require('../index');

describe('NaN', function(){

  it('identifies valid', function(){
    var values = [
      NaN, parseInt("red")
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.nan().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      1/0,
      null,
      "",
      0,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.nan().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
