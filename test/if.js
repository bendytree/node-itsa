
var assert = require("chai").assert;
var itsa = require('../index');

describe('if', function(){

  it('throws with no test & itsa given', function(){
    assert.throws(function(){ itsa.if(); });
    assert.throws(function(){ itsa.if(23); });
    assert.throws(function(){ itsa.if("abc"); });
    assert.throws(function(){ itsa.if(function(){}); });
    assert.throws(function(){ itsa.if({}); });
    assert.throws(function(){ itsa.if(null, itsa.string()); });
    assert.throws(function(){ itsa.if(function(){}, function(){}); });
    assert.throws(function(){ itsa.if(function(){}, {}); });

    //no throw
    itsa.if(function(){}, itsa.string());
    itsa.if({}, itsa.string());
  });

  it('function test - does not validate when test fails', function(){
    var isValid = itsa.if(function(data){ return data === "xyz"; }, itsa.number()).validate("abc").valid;
    assert.equal(isValid, true);
  });

  it('function test - does validate when test succeeds', function(){
    var isValid = itsa.if(function(data){ return data === "abc"; }, itsa.number()).validate("abc").valid;
    assert.equal(isValid, false);
  });

  it('object test - does not validate when test fails', function(){
    var isValid = itsa.if({type:"video"}, itsa.object({videoId:itsa.string()})).validate({type:"pdf"}).valid;
    assert.equal(isValid, true);
  });

  it('object test - does validate when test succeeds', function(){
    var isValid = itsa.if({type:"video"}, itsa.object({videoId:itsa.string()})).validate({type:"video"}).valid;
    assert.equal(isValid, false);
  });

});
