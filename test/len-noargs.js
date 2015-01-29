
var assert = require("chai").assert;
var itsa = require('../index');

describe('len-noargs', function(){

  it('identifies valid', function(){
    var values = [
      "a", "red", "green", [4], [3,53], {length:true}
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      [],
      {},
      {length:0},
      {length:false},
      null,
      undefined
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
