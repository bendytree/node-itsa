
var assert = require("chai").assert;
var itsa = require('../index');

describe('primitives', function(){

  it('are converted to `.equal(...)` (in any)', function(){
    assert.equal(itsa.any("Bob", 42).validate("Bob").valid, true, "Bob");
    assert.equal(itsa.any("Bob", 42).validate(42).valid, true, "42");
    assert.equal(itsa.any("Bob", 42).validate(66).valid, false, "66");
  });

  it('are converted to `.equal(...)` (in object)', function(){
    assert.equal(itsa.object({type:"db.user"}).validate({type:"db.user"}).valid, true, "db.user");
    assert.equal(itsa.object({type:"db.user"}).validate({type:"db.product"}).valid, false, "db.product");
  });

  //it('are converted to `.equal(...)` (in array)', function(){
  //  assert.equal(itsa.array({type:"db.user"}).validate("db.user").valid, true, "db.user");
  //  assert.equal(itsa.array({type:"db.user"}).validate("db.product").valid, true, "db.product");
  //});

});
