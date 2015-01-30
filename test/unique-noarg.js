
var assert = require("chai").assert;
var itsa = require('../index');

describe('unique-noargs', function(){

  it('identifies valid', function(){
    var values = [
      [],
      [1,2,3],
      [1,true],
      ["a","b"],
      {},
      {a:1,b:2},
      {a:1,b:true},
      "",
      "abc"
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.unique().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      null,
      undefined,
      0,
      [1,2,2],
      ["a","a"],
      {a:1,b:1},
      "aab",
      "a--"
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.unique().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
