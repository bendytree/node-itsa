
var assert = require("chai").assert;
var itsa = require('../index');

describe('update', function(){

  it('throws if no value is given', function(){
    assert.throws(function(){
      itsa.object({
        color: itsa.update()
      });
    });
  });

  it('fails if run without a parent object', function(){
    assert.equal(itsa.string().update("red").validate("xyz").valid, false);
  });

  it('succeeds if run with a parent object', function(){
    assert.equal(itsa.object({ color: itsa.update("red") }).validate({color:"blue"}).valid, true);
  });

  it('does not cause validation to fail', function(){
    assert.equal(itsa.object({ color: itsa.update("red") }).validate({}).valid, true);
  });

  it('always sets a value (original falsy case)', function(){
    var obj = { color: null };
    itsa.object({ color: itsa.update("red") }).validate(obj);
    assert.equal(obj.color, "red");
  });

  it('always sets a value (original truthy case)', function(){
    var obj = { color: "blue" };
    itsa.object({ color: itsa.update("red") }).validate(obj);
    assert.equal(obj.color, "red");
  });

  it('updated value is used for future validations', function(){
    var obj = { color: 443322 };
    var result = itsa.object({ color: itsa.update("red").string() }).validate(obj);
    assert.equal(obj.color, "red");
    assert.equal(result.valid, true);
  });

  it('uses function result if update value is a function', function(){
    var obj = { color: null };
    itsa.object({ color: itsa.update(function(){ return "red"; }) }).validate(obj);
    assert.equal(obj.color, "red");
  });

  it('works on multiple fields of an object', function(){
    var obj = { color: 887766 };
    var validator = itsa.object({
      color: itsa.update("red"),
      backgroundColor: itsa.update("green")
    });
    assert.equal(validator.validate(obj).valid, true, "Should be valid");
    assert.equal(obj.color, "red");
    assert.equal(obj.backgroundColor, "green");
  });

  it('works on nested fields of an object', function(){
    var obj = { border: true };
    var validator = itsa.object({
      border: itsa.update({}).object({
        color: itsa.update("yellow")
      })
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(obj.border.color, "yellow");
  });

});
