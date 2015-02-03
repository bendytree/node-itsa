
var assert = require("chai").assert;
var itsa = require('../index');

describe('extended prototypes', function(){

  it('of array - does not break validation', function(){
    Array.prototype.dumb = function(){};
    assert.equal(itsa.object({}).validate({}).valid, true);
    delete Array.prototype.dumb;
  });

  it('of array - does not break validation of nested array', function(){
    Array.prototype.dumb = function(){};
    assert.equal(itsa.arrayOf(itsa.array()).validate([[]]).valid, true);
    delete Array.prototype.dumb;
  });

  it('of object - does not break validation', function(){
    Object.prototype.dumb = function(){};
    assert.equal(itsa.object({}).validate({}).valid, true);
    delete Object.prototype.dumb;
  });

  it('of object - does not break validation on nested object', function(){
    Object.prototype.dumb = function(){};
    var result = itsa.object({a:itsa.object()}).validate({a:{}});
    assert.equal(result.valid, true, "Should have been valid. " + result.describe());
    delete Object.prototype.dumb;
  });

  it('of array - does not break `any` validation', function(){
    Array.prototype.dumb = "dumb";
    assert.equal(itsa.any(itsa.object()).validate("dumb").valid, false);
    delete Array.prototype.dumb;
  });

  it('of array - does not break primitive check validation', function(){
    Array.prototype.dumb = function(){};
    var result = itsa.object({
      fields: undefined
    }).validate({
      fields: undefined
    });
    assert.equal(result.valid, true);
    delete Array.prototype.dumb;
  });

});
