
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-integer', function(){

  it('works on values that become integers', function(){
    var values = [
      {from: "1", to:1},
      {from: "22a", to:22},
      {from: 3.3, to:3},
      {from: new Date(1234567), to:1234567}
    ];
    for (var i = 0; i < values.length; i++){
      var value = values[i];
      var obj = {age:value.from};
      var validator = itsa.object({
        age: itsa.toInteger()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid: "+JSON.stringify(value));
      assert.equal(obj.age, value.to, JSON.stringify(value));
    }
  });

  it('does nothing on non integer values and fails validation', function(){
    var values = [
      "abc",
      "",
      "a b",
      null,
      undefined,
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
