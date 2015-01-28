
var assert = require("chai").assert;
var itsa = require('../index');

describe('short circuiting', function(){

  it('does not run object field validators if object validation fails', function(){
    var result = itsa.object({user:itsa.object({name:itsa.string()})}).validate({});
    assert.equal(result.logs.length, 2, "2 validations should have been run");
    assert.equal(result.logs[0].validator, "object", "`validator` should be `object`.");
    assert.equal(result.logs[1].validator, "object", "`validator` should be `object`.");
  });

  it('stops running validators on a field when one fails', function(){
    var result = itsa.string().maxLength(3).validate({});
    assert.equal(result.logs.length, 1, "1 validation should have been run");
    assert.equal(result.logs[0].validator, "string", "`validator` should be `string`.");
  });

});
