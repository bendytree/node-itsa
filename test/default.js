
var assert = require("chai").assert;
var itsa = require('../index');

describe('default', function(){

  it('throws if no value is given', function(){
    assert.throws(function(){
      itsa.object({
        color: itsa.default()
      });
    });
  });

  it('fails if run without a parent object', function(){
    assert.equal(itsa.string().default("red").validate("xyz").valid, false);
  });

  it('succeeds if run with a parent object', function(){
    assert.equal(itsa.object({ color: itsa.default("red") }).validate({color:"blue"}).valid, true);
  });

  it('does not cause validation to fail', function(){
    assert.equal(itsa.object({ color: itsa.default("red") }).validate({}).valid, true);
  });

  it('sets a value if the original was falsy', function(){
    var obj = { color: null };
    itsa.object({ color: itsa.default("red") }).validate(obj);
    assert.equal(obj.color, "red");
  });

  it('does not set a value if the original was truthy', function(){
    var obj = { color: "blue" };
    itsa.object({ color: itsa.default("red") }).validate(obj);
    assert.equal(obj.color, "blue");
  });

  it('defaulted value is used for future validations', function(){
    var obj = {  };
    var result = itsa.object({ color: itsa.default("red").string() }).validate(obj);
    assert.equal(obj.color, "red");
    assert.equal(result.valid, true);
  });

  it('uses function result if default value is a function', function(){
    var obj = { color: null };
    itsa.object({ color: itsa.default(function(){ return "red"; }) }).validate(obj);
    assert.equal(obj.color, "red");
  });

  it('works on multiple fields of an object', function(){
    var obj = { color: null };
    var validator = itsa.object({
      color: itsa.default("red"),
      backgroundColor: itsa.default("green")
    });
    assert.equal(validator.validate(obj).valid, true, "Should be valid");
    assert.equal(obj.color, "red");
    assert.equal(obj.backgroundColor, "green");
  });

  it('works on nested fields of an object', function(){
    var obj = { border: null };
    var validator = itsa.object({
      border: itsa.default({}).object({
        color: itsa.default("yellow")
      })
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(obj.border.color, "yellow");
  });

});
