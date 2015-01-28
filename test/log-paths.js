
var assert = require("chai").assert;
var itsa = require('../index');

describe('log paths', function(){

  it('identifies bad object paths', function(){
    var result = itsa.object({name:itsa.string()}).validate({});
    assert.equal(result.logs.length, 2, "2 validation should have been run");
    assert.equal(result.logs[0].path, "", "The path should be blank.");
    assert.equal(result.logs[1].path, "name", "The path should be `name`.");
    assert.equal(result.logs[1].valid, false, "`valid` should be false.");
    assert.equal(result.logs[1].validator, "string", "`validator` should be `string`.");
  });

  it('identifies bad object paths in depth > 1 objects', function(){
    var result = itsa.object({user:itsa.object({name:itsa.string()})}).validate({});
    assert.equal(result.logs.length, 2, "1 validation should have been run");
    assert.equal(result.logs[1].path, "user", "The path should be `user`.");
    assert.equal(result.logs[1].valid, false, "`valid` should be false.");
    assert.equal(result.logs[1].validator, "object", "`validator` should be `object`.");
  });

});
