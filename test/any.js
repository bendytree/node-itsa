
var assert = require("chai").assert;
var itsa = require('../index');

describe('any', function(){

  it('throws if it receives no validators', function(){
    var didThrow = false;
    try {
      itsa.any();
    }catch(e){
      didThrow = true;
    }
    assert.equal(didThrow, true, "Should have thrown an error.");
  });

  it('multiple validators are passed as arguments and/or arrays', function(){
    var result = itsa.any(itsa.maxLength(3), [itsa.maxLength(3), itsa.string()]).validate("");
    assert.equal(result.valid, true, "Should be valid since last validator is string.");
  });

  it('if data is valid then the logs include the any validator and the successful validator', function(){
    var result = itsa.any(itsa.object(), itsa.string()).validate("");
    assert.equal(result.valid, true, "Should be valid.");
    assert.equal(result.logs.length, 2, "Should be 2.");
    assert.equal(result.logs[0].validator, "any", "Should be `any`.");
    assert.equal(result.logs[1].validator, "string", "Should be `string`.");
  });

  it('if data is valid then the logs include logs for nested properties if they exist', function(){
    var result = itsa.object({
      user: itsa.any(
        itsa.string(),
        itsa.object({ name: itsa.string() })
      )
    }).validate({user:{name:"Bob"}});
    assert.equal(result.valid, true, "Should be valid.");
    assert.equal(result.logs.length, 4, "Should be 4.");
    assert.equal(result.logs[0].validator, "object", "Should be `object`.");
    assert.equal(result.logs[1].validator, "any", "Should be `any`.");
    assert.equal(result.logs[1].path, "user", "Any path should be `user`.");
    assert.equal(result.logs[2].validator, "object", "Should be `object`.");
    assert.equal(result.logs[2].path, "user", "Any->object path should be `user`.");
    assert.equal(result.logs[3].validator, "string", "Should be `string`.");
    assert.equal(result.logs[3].path, "user.name", "Deep path be `user.name`.");
  });

  it('if data is invalid, the logs only include the any validator', function(){
    var result = itsa.any(itsa.object(), itsa.string()).validate(42);
    assert.equal(result.valid, false, "Should be invalid.");
    assert.equal(result.logs.length, 1, "Should be 1.");
    assert.equal(result.logs[0].validator, "any", "Should be `any`.");
  });

});
