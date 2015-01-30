
var assert = require("chai").assert;
var itsa = require('../index');

describe('default-now', function(){

  it('fails if run without a parent object', function(){
    assert.equal(itsa.defaultNow().validate().valid, false);
  });

  it('works on falsy original values', function(){
    var obj = { };
    var validator = itsa.object({
      created: itsa.defaultNow()
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(Object.prototype.toString.call(obj.created), "[object Date]");
  });

  it('does not update truthy values', function(){
    var originalUpdated = new Date(0);
    var obj = { updated: originalUpdated };
    var validator = itsa.object({
      updated: itsa.defaultNow()
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(Object.prototype.toString.call(obj.updated), "[object Date]");
    assert.equal(originalUpdated, obj.updated, "Date should not have changed");
  });

});
