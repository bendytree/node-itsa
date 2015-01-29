
var assert = require("chai").assert;
var itsa = require('../index');

describe('number', function(){

  it('identifies valid', function(){
    var values = [
      1, 3, 0, -234, 3.94324234
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.number().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
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
      assert.equal(itsa.number().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
