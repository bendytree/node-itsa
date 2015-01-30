
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-float', function(){

  it('works on values that become floats', function(){
    var values = {
      "1": 1,
      "1.5": 1.5,
      "22a": 22,
      "22.5a": 22.5
    };
    for (var key in values){
      var obj = {gpa:key};
      var validator = itsa.object({
        gpa: itsa.toFloat()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid: "+JSON.stringify(key));
      assert.equal(obj.gpa, values[key], JSON.stringify(key));
    }
  });

  it('does nothing on non float values and fails validation', function(){
    var values = [
      "abc",
      "",
      "a b",
      null,
      undefined,
      new Date(),
      {a:2},
      {}
    ];
    for (var i in values){
      var val = values[i];
      var obj = {gpa:val};
      var validator = itsa.object({
        gpa: itsa.toFloat()
      });
      assert.equal(validator.validate(obj).valid, false, "Should be invalid: "+JSON.stringify(val));
      assert.equal(obj.gpa, val, JSON.stringify(val));
    }
  });

});
