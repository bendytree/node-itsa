
var assert = require("chai").assert;
var itsa = require('../index');

describe('equal', function(){

  it('throws with no value to compare to', function(){
    var didThrow = false;
    try {
      itsa.equal();
    }catch(e){
      didThrow = true;
    }
    assert.equal(didThrow, true, "Should have thrown an error.");
  });

  it('identifies valid', function(){
    assert.equal(itsa.equal("Bob").validate("Bob").valid, true, "Bob");
    assert.equal(itsa.equal(42).validate(42).valid, true, "42");
    assert.equal(itsa.equal(true).validate(true).valid, true, "true");
    assert.equal(itsa.equal(false).validate(false).valid, true, "false");
    assert.equal(itsa.equal(undefined).validate(undefined).valid, true, "undefined");
    assert.equal(itsa.equal(null).validate(null).valid, true, "null");
    assert.equal(itsa.equal(0).validate(0).valid, true, "0");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.equal("Bob").validate(new String("Bob")).valid, false, "Bob");
    assert.equal(itsa.equal(0).validate(false).valid, false, "0===false");
    assert.equal(itsa.equal(undefined).validate(null).valid, false, "undefined===null");
    assert.equal(itsa.equal(false).validate(undefined).valid, false, "undefined===null");
    assert.equal(itsa.equal([]).validate([]).valid, false, "[]");
    assert.equal(itsa.equal({}).validate({}).valid, false, "{}");
  });

});
