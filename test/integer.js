
var assert = require("chai").assert;
var itsa = require('../index');

describe('integer', function(){

  it('identifies valid', function(){
    var values = [
      1, 3, 0, -234, 3.0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.integer().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      3.2,
      undefined,
      null,
      "3",
      "0",
      new Date(),
      [],
      NaN,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.integer().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
