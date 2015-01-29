
var assert = require("chai").assert;
var itsa = require('../index');

describe('minLength', function(){

  it('throws with no length', function(){
    assert.throws(function(){
      itsa.minLength();
    });
  });


  it('identifies valid', function(){
    var values = [
      "red", "green", [3,4,5], {length:3}
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.minLength(3).validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      "hi",
      [],
      [2,4],
      {},
      {length:1},
      null,
      undefined,
      new Date()
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.minLength(3).validate(values[i]).valid, false, String(values[i]));
    }
  });

});
