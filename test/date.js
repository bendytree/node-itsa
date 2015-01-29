
var assert = require("chai").assert;
var itsa = require('../index');

describe('date', function(){

  it('identifies valid', function(){
    var values = [
      new Date(),
      new Date(1524644932046)
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.date().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      new Date("red"),
      undefined,
      null,
      "0",
      1524644932046,
      NaN
    ];
    for (var i=0; i<values.length; i++) {
      assert.equal(itsa.date().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
