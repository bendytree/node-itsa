
var assert = require("chai").assert;
var itsa = require('../index');

describe('logs', function(){

  it('list valid and invalid results', function(){
    var result = itsa.string().maxLength(3).validate("bacon");
    assert.equal(result.valid, false, "Overall result should be valid=false");
    assert.equal(result.logs.length, 2, "2 validations should have been run");
    assert.equal(result.logs[0].path, "", "The path should be blank.");
    assert.equal(result.logs[0].valid, true, "`valid` should be true.");
    assert.equal(result.logs[0].validator, "string", "`validator` should be `string`.");
    assert.equal(result.logs[1].path, "", "The path should be blank.");
    assert.equal(result.logs[1].valid, false, "`valid` should be true.");
    assert.equal(result.logs[1].validator, "maxLength", "`validator` should be `maxLength`.");
  });

});
