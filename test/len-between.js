
var assert = require("chai").assert;
var itsa = require('../index');

describe('len-between', function(){

  it('identifies valid', function(){
    var values = [
      "a", "ab", "abc",
      [5], [5,6], [5,6,7],
      {length:1}, {length:2.5}, {length:3},
      {length:true},
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len(1,3).validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      "blue",
      [],
      [36,65,76,65],
      {},
      {length:4},
      {length:false},
      null,
      undefined
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.len(1,3).validate(values[i]).valid, false, JSON.stringify(values[i]));
    }
  });

});
