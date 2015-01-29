
var assert = require("chai").assert;
var itsa = require('../index');

describe('alphanumeric', function(){

  it('identifies valid', function(){
    var values = [
      "",
      "abcxyz",
      "ABCXYZ",
      "123",
      "abcABCxyzXYZ123",
      99,
      0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.alphanumeric().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "ab-cd",
      "ab cd",
      undefined, null
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.alphanumeric().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
