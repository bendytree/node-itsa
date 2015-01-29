
var assert = require("chai").assert;
var itsa = require('../index');

describe('hex', function(){

  it('identifies valid', function(){
    var values = [
      "",
      "abc",
      "ABC",
      "123",
      "abcABC123",
      99,
      0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.hex().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "ab-cd",
      "ab cd",
      "abcxyz",
      undefined, null
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.hex().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
