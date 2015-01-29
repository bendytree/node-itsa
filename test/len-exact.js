
var assert = require("chai").assert;
var itsa = require('../index');

describe('len-exact', function(){

  it('identifies valid', function(){
    var values = [
      "hi", [4,6], {length:2}
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len(2).validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      "hello",
      [],
      [1],
      [36,65,76],
      {length:4},
      {length:true},
      null,
      undefined
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len(2).validate(values[i]).valid, false, String(values[i]));
    }
  });

});
