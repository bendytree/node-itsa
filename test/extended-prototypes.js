
var assert = require("chai").assert;
var itsa = require('../index');

describe('extended prototypes', function(){

  it('of array - does not break validation', function(){
    Array.prototype.dumb = function(){};
    assert.equal(itsa.object({}).validate({}).valid, true);
    delete Array.prototype.dumb;
  });

  it('of object - does not break validation', function(){
    Object.prototype.dumb = function(){};
    assert.equal(itsa.object({}).validate({}).valid, true);
    delete Object.prototype.dumb;
  });

});
