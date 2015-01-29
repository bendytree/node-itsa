
var assert = require("chai").assert;
var itsa = require('../index');

describe('array', function(){

  it('identifies arrays', function(){
    assert.equal(itsa.array().validate([]).valid, true, "Empty array");
    assert.equal(itsa.array().validate([1,"two"]).valid, true, "Array with values");
    assert.equal(itsa.array().validate(new Array()).valid, true, "new Array()");
  });

  it('identifies invalid arrays', function(){
    assert.equal(itsa.array().validate().valid, false, "No arg");
    assert.equal(itsa.array().validate(undefined).valid, false, "undefined");
    assert.equal(itsa.array().validate(null).valid, false, "null");
    assert.equal(itsa.array().validate(1).valid, false, "1");
    assert.equal(itsa.array().validate("").valid, false, "string");
    assert.equal(itsa.array().validate({length:1}).valid, false, "object");
  });

  it('example parameter must be an array if it is given', function(){
    assert.throws(function(){ itsa.array(null); });
    assert.throws(function(){ itsa.array(undefined); });
    assert.throws(function(){ itsa.array({}); });
    assert.throws(function(){ itsa.array("abc"); });
    itsa.array([]);
    itsa.array();
  });

  it('if example is given then items must match (valid case)', function(){
    assert.equal(itsa.array([itsa.string()]).validate([""]).valid, true, "string");
    assert.equal(itsa.array([itsa.string(), itsa.object()]).validate(["", {}]).valid, true, "string, object");
  });

  it('if example is given then items must match (invalid case)', function(){
    assert.equal(itsa.array([itsa.string()]).validate([42]).valid, false, "string");
    assert.equal(itsa.array([itsa.string(), itsa.object()]).validate(["abc", 42]).valid, false, "string, object");
  });

  it('if no example is given then items are not validated', function(){
    assert.equal(itsa.array().validate([42]).valid, true, "string");
  });

  it('if example is given then extra items in data are considered invalid by default', function(){
    assert.equal(itsa.array([itsa.string()]).validate(["abc",42]).valid, false, "string");
  });

  it('extra items can be allowed by true as second arg (allowExtraItems)', function(){
    assert.equal(itsa.array([itsa.string()], true).validate(["abc",42]).valid, true, "string");
  });

  it('default values can be used in arrays', function(){
    var arr = [0];
    var result = itsa.array([
      itsa.default("red").string(),
      itsa.default("blue").string(),
    ]).validate(arr);
    assert.equal(result.valid, true, "valid");
    assert.equal(arr.length, 2, "array length");
    assert.equal(arr[0], "red", "red");
    assert.equal(arr[1], "blue", "blud");
  });

  it('update values can be used in arrays', function(){
    var arr = [];
    var result = itsa.array([itsa.update("red").string()]).validate(arr);
    assert.equal(result.valid, true, "valid");
    assert.equal(arr.length, 1, "array length");
    assert.equal(arr[0], "red", "red");
  });

  it('errors within arrays include the path', function(){
    var validator = itsa.array([
      itsa.object({
        name: itsa.string()
      })
    ]);
    var result = validator.validate([{}]);
    assert.equal(result.valid, false, "valid");
    assert.equal(result.describe().indexOf("0.name") > -1, true, "description");
  });

});
