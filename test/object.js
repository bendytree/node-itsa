
var assert = require("chai").assert;
var itsa = require('../index');

describe('object', function(){

  it('identifies valid', function(){
    assert.equal(itsa.object().validate({}).valid, true, "Empty object is an object");
    assert.equal(itsa.object().validate({a:"b"}).valid, true, "{a:'b'} is a valid object");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.object().validate().valid, false, "No arg should not be a valid object");
    assert.equal(itsa.object().validate(undefined).valid, false, "undefined is not a valid object");
    assert.equal(itsa.object().validate(null).valid, false, "null is not a valid object");
    assert.equal(itsa.object().validate(1).valid, false, "1 is not a valid object");
    assert.equal(itsa.object().validate("").valid, false, "A string is not a valid object");
    assert.equal(itsa.object().validate(["xyz"]).valid, false, "An array is not a valid object");
  });

  it('is chainable', function(){
    assert.equal(typeof itsa.object().object().object, "function", "itsa.object().object().object should be a function");
  });

  it('fails if a field is invalid', function(){
    var result = itsa.object({name:itsa.string()}).validate({});
    assert.equal(result.valid, false, "Root object should be invalid if field is.");
    assert.equal(result.logs.length, 2, "2 validations should exist.");
    assert.equal(result.logs[0].path, "", "Path should be blank");
    assert.equal(result.logs[0].validator, "object", "Validator should be `object`");
    assert.equal(result.logs[0].valid, true, "Should be directly valid");
  });

  it('field does not invalidate ancestory', function(){
    var result = itsa.object({user:itsa.object({name:itsa.string()})}).validate({user:{name:7}});
    assert.equal(result.valid, false, "Root object should be invalid.");
    assert.equal(result.logs.length, 3, "3 validations should exist.");
    assert.equal(result.logs[0].path, "", "Path should be blank");
    assert.equal(result.logs[0].validator, "object", "Validator should be `object`");
    assert.equal(result.logs[0].valid, true, "Should be valid");
    assert.equal(result.logs[1].path, "user", "Path should be blank");
    assert.equal(result.logs[1].validator, "object", "Validator should be `object`");
    assert.equal(result.logs[1].valid, true, "Should be valid");
    assert.equal(result.logs[2].path, "user.name", "Path should be blank");
    assert.equal(result.logs[2].validator, "string", "Validator should be `object`");
    assert.equal(result.logs[2].valid, false, "Should be invalid");
  });

});
