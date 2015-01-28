
var assert = require("chai").assert;
var itsa = require('../index');

describe('object fields', function(){

  /* DEPTH == 1 */

  it('identifies valid', function(){
    var result = itsa.object({name:itsa.string()}).validate({name:"Bob"});
    assert.equal(result.valid, true, "`name` field should be correct");
  });

  it('identifies invalid', function(){
    var result = itsa.object({name:itsa.string()}).validate({});
    assert.equal(result.valid, false, "Missing `name` field should be required.");
  });


  /* DEPTH == 2 */

  it('identifies deep valid', function(){
    var schema = itsa.object({
      user:itsa.object({
        name:itsa.string()
      })
    });
    var result = schema.validate({user:{name:"Bob"}});
    assert.equal(result.valid, true, "`name` field should be correct");
  });

  it('identifies deep invalid', function(){
    var schema = itsa.object({
      user:itsa.object({
        name:itsa.string()
      })
    });
    var result = schema.validate({user:{}});
    assert.equal(result.valid, false, "Missing `name` field should be required.");
  });


  /* FIELD LOGS */

  it('lists logs for object and its fields', function(){
    var result = itsa.object({name:itsa.string()}).validate({name:"bacon"});
    assert.equal(result.logs.length, 2, "2 validations should have been run");
    assert.equal(result.logs[0].path, "", "The path should be blank.");
    assert.equal(result.logs[0].validator, "object", "`validator` should be `object`.");
    assert.equal(result.logs[1].path, "name", "The path should be blank.");
    assert.equal(result.logs[1].validator, "string", "`validator` should be `object`.");
  });

});
