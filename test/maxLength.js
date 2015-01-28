
var assert = require("chai").assert;
var itsa = require('../index');

describe('maxLength', function(){

  it('throws with no length', function(){
    var didThrow = false;
    try {
      itsa.maxLength();
    }catch(e){
      didThrow = true;
    }
    assert.equal(didThrow, true, "Should have thrown an error.");
  });

  it('identifies valid lengths', function(){
    assert.equal(itsa.maxLength(3).validate("").valid, true, "Empty string is valid");
    assert.equal(itsa.maxLength(3).validate("xyz").valid, true, "'xyz' is valid");
    assert.equal(itsa.maxLength(3).validate([9,8]).valid, true, "[9,8] is valid");
    assert.equal(itsa.maxLength(3).validate({length:2}).valid, true, "{length:2} is valid");
  });

  it('identifies invalid lengths', function(){
    assert.equal(itsa.maxLength(3).validate("abcd").valid, false, "Long string");
    assert.equal(itsa.maxLength(3).validate().valid, false, "No arg");
    assert.equal(itsa.maxLength(3).validate(undefined).valid, false, "undefined");
    assert.equal(itsa.maxLength(3).validate(null).valid, false, "null");
    assert.equal(itsa.maxLength(3).validate(1).valid, false, "1");
    assert.equal(itsa.maxLength(3).validate({}).valid, false, "object");
    assert.equal(itsa.maxLength(3).validate({length:"long"}).valid, false, "object with string length");
    assert.equal(itsa.maxLength(3).validate([1,2,3,4]).valid, false, "array");
  });

});
