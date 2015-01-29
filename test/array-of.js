
var assert = require("chai").assert;
var itsa = require('../index');

describe('arrayOf', function(){

  it('identifies arrays', function(){
    assert.equal(itsa.arrayOf().validate([]).valid, true, "Empty array");
    assert.equal(itsa.arrayOf().validate([1,"two"]).valid, true, "Array with values");
    assert.equal(itsa.arrayOf().validate(new Array()).valid, true, "new Array()");
  });

  it('identifies invalid arrays', function(){
    assert.equal(itsa.arrayOf().validate().valid, false, "No arg");
    assert.equal(itsa.arrayOf().validate(undefined).valid, false, "undefined");
    assert.equal(itsa.arrayOf().validate(null).valid, false, "null");
    assert.equal(itsa.arrayOf().validate(1).valid, false, "1");
    assert.equal(itsa.arrayOf().validate("").valid, false, "string");
    assert.equal(itsa.arrayOf().validate({length:1}).valid, false, "object");
  });

  it('if example is given then items must match (valid case)', function(){
    assert.equal(itsa.arrayOf(itsa.string()).validate([]).valid, true, "blank");
    assert.equal(itsa.arrayOf(itsa.string()).validate(["a"]).valid, true, "a");
    assert.equal(itsa.arrayOf(itsa.string()).validate(["a", "b"]).valid, true, "a,b");
  });

  it('if example is given then items must match (invalid case)', function(){
    assert.equal(itsa.arrayOf(itsa.string()).validate([undefined]).valid, false, "undefined");
    assert.equal(itsa.arrayOf(itsa.string()).validate([42]).valid, false, "42");
    assert.equal(itsa.arrayOf(itsa.string()).validate(["a", 42]).valid, false, "a,42");
  });

  it('example can be a validator function', function(){
    var isMod3 = function(val){ return val % 3 === 0; };
    assert.equal(itsa.arrayOf(isMod3).validate([3, 6, 9]).valid, true, "valid");
    assert.equal(itsa.arrayOf(isMod3).validate([3, 6, 10]).valid, false, "invalid");
  });

  it('example can be a primitive for a strict equality check', function(){
    assert.equal(itsa.arrayOf(3).validate([3, 3]).valid, true, "valid");
    assert.equal(itsa.arrayOf(3).validate([3, 4]).valid, false, "invalid");
  });

  it('default values can be used and only effects existing values', function(){
    var arr = [0];
    var result = itsa.arrayOf(itsa.default("red").string()).validate(arr);
    assert.equal(result.valid, true, "valid");
    assert.equal(arr.length, 1, "array length");
    assert.equal(arr[0], "red", "red");
  });

  it('default values do not create items from nothing', function(){
    var arr = [];
    var result = itsa.arrayOf(itsa.default("red").string()).validate(arr);
    assert.equal(result.valid, true, "valid");
    assert.equal(arr.length, 0, "array length");
  });

  it('update values can be used in arrays', function(){
    var arr = ["blue"];
    var result = itsa.arrayOf(itsa.update("red").string()).validate(arr);
    assert.equal(result.valid, true, "valid");
    assert.equal(arr.length, 1, "array length");
    assert.equal(arr[0], "red", "red");
  });

  it('errors within arrays include the path', function(){
    var validator = itsa.arrayOf(
      itsa.object({
        name: itsa.string()
      })
    );
    var result = validator.validate([{}]);
    assert.equal(result.valid, false, "valid");
    assert.equal(result.describe().indexOf("0.name") > -1, true, "description");
  });

});
