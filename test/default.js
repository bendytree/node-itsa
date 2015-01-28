
var assert = require("chai").assert;
var itsa = require('../index');

describe('default values', function(){

  it('throws with no value to compare to', function(){
    var didThrow = false;
    try {
      itsa.equal();
    }catch(e){
      didThrow = true;
    }
    assert.equal(didThrow, true, "Should have thrown an error.");
  });

});
