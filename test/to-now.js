
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-now', function(){

  it('fails if run without a parent object', function(){
    assert.equal(itsa.toNow().validate().valid, false);
  });

  it('works on falsy original values', function(){
    var obj = { };
    var validator = itsa.object({
      updated: itsa.toNow()
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(Object.prototype.toString.call(obj.updated), "[object Date]");
  });

  it('runs regardless of old data', function(){
    var originalUpdated = new Date(0);
    var obj = { updated: originalUpdated };
    var validator = itsa.object({
      updated: itsa.toNow()
    });
    var result = validator.validate(obj);
    assert.equal(result.valid, true, "Should be valid");
    assert.equal(Object.prototype.toString.call(obj.updated), "[object Date]");
    assert.equal(originalUpdated === obj.updated, false, "Date should have changed");
  });

});
