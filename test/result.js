
var assert = require("chai").assert;
var itsa = require('../index');

describe('result', function(){

  it('has boolean valid property', function(){
    assert.equal(typeof itsa.string().validate("abc").valid, "boolean", "Should be a boolean.");
    assert.equal(typeof itsa.string().validate({}).valid, "boolean", "Should be a boolean.");
  });

  it('has an array of logs', function(){
    assert.equal(Object.prototype.toString.call(itsa.string().validate("abc").logs), "[object Array]", "Should be an array.");
    assert.equal(Object.prototype.toString.call(itsa.string().validate({}).logs), "[object Array]", "Should be an array.");
  });

  it('can describe successful results', function(){
    var description = itsa.string().validate("abc").describe();
    assert.equal(description, "Validation succeeded.", "Success should have a good description.");
  });

  it('can describe failed results', function(){
    var description = itsa.object({user:itsa.object({name:itsa.string()})}).validate({user:{}}).describe();
    assert.equal(description.indexOf("user.name") > -1, true, "Failure description should include details.");
  });

});
