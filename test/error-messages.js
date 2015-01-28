
var assert = require("chai").assert;
var itsa = require('../index');

describe('custom error messages', function(){

  it('can be provided', function(){
    assert.equal(itsa.string().validate(42).describe(), "Expected a string, but found a number", "Standard error");
    assert.equal(itsa.string().msg("Hash tag fail").validate(42).describe(), "Hash tag fail", "Custom error");
  });

  it('are per validation', function(){
    assert.equal(itsa.string().msg("message 1").maxLength(3).msg("message 2").validate(42).describe(), "message 1");
    assert.equal(itsa.string().msg("message 1").maxLength(3).msg("message 2").validate("real long string").describe(), "message 2");
  });

  it('work on objects with field validations', function(){
    assert.equal(itsa.object({name:itsa.string().msg("Name is required")}).msg("Object is required").validate(42).describe(), "Object is required");
  });

  it('work on object fields (and ignore paths)', function(){
    assert.equal(itsa.object({name:itsa.string().msg("Name is required")}).msg("Object is required").validate({}).describe(), "Name is required");
  });

  it('.msg(...) cannot be called on itsa class', function(){
    assert.throws(function(){
      itsa.msg();
    });
  });

  it('.msg(...) must be given a string', function(){
    assert.throws(function(){
      itsa.string().msg();
    });
  });

  it('.msg(...) must be given a string with length > 0', function(){
    assert.throws(function(){
      itsa.string().msg("");
    });
  });

});
