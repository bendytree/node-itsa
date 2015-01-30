
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-integer', function(){

  it('works on values that become integers', function(){
    var values = {
      "1": 1,
      "22a": 22,
      3.3: 3
    };
    for (var key in values){
      var obj = {age:key};
      var validator = itsa.object({
        age: itsa.toInteger()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid: "+JSON.stringify(key));
      assert.equal(obj.age, values[key], JSON.stringify(key));
    }
  });

  it('does nothing on non integer values and fails validation', function(){
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
      var obj = {age:val};
      var validator = itsa.object({
        age: itsa.toInteger()
      });
      assert.equal(validator.validate(obj).valid, false, "Should be invalid: "+JSON.stringify(val));
      assert.equal(obj.age, val, JSON.stringify(val));
    }
  });

  it('defaults to radix 10', function(){
    var obj = {age:"08"};
    var validator = itsa.object({ age: itsa.toInteger() });
    validator.validate(obj);
    assert.equal(obj.age, 8);
  });

  it('radix can be overridden', function(){
    var obj = {age:"10"};
    var validator = itsa.object({ age: itsa.toInteger(8) });
    validator.validate(obj);
    assert.equal(obj.age, 8);
  });

});
