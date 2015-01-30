
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-lowercase', function(){

  it('works on strings with uppercase characters', function(){
    var values = {
      "A": "a",
      "AbC": "abc",
      " a-bC ": " a-bc ",
      "\nNEWLINE \n ": "\nnewline \n "
    };
    for (var key in values){
      var obj = {text:key};
      var validator = itsa.object({
        text: itsa.toLowercase()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid");
      assert.equal(obj.text, values[key], JSON.stringify(key));
    }
  });

  it('does not do anything to strings without uppercase or other values', function(){
    var values = [
      "abc",
      "",
      "a b",
      99,
      null,
      undefined,
      [43],
      new Date(),
      {a:2},
      {}
    ];
    for (var i in values){
      var val = values[i];
      var obj = {text:val};
      var validator = itsa.object({
        text: itsa.toLowercase()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid");
      assert.equal(obj.text, val, JSON.stringify(val));
    }
  });

});
