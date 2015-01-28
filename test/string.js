
var assert = require("chai").assert;
var itsa = require('../index');

describe('string', function(){

  it('identifies valid', function(){
    assert.equal(itsa.string().validate("").valid, true, "Empty string is a string");
    assert.equal(itsa.string().validate("xyz").valid, true, "'xyz' is a valid string");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.string().validate().valid, false, "No arg should not be a valid string");
    assert.equal(itsa.string().validate(undefined).valid, false, "undefined is not a valid string");
    assert.equal(itsa.string().validate(null).valid, false, "null is not a valid string");
    assert.equal(itsa.string().validate(1).valid, false, "1 is not a valid string");
    assert.equal(itsa.string().validate({}).valid, false, "An object is not a valid string");
    assert.equal(itsa.string().validate(["xyz"]).valid, false, "An array is not a valid string");
  });

  it('is chainable', function(){
    assert.equal(typeof itsa.string().string, "function", "itsa.string().string should be a function");
    assert.equal(typeof itsa.string().string().string, "function", "itsa.string().string().string should be a function");
  });

});
