
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-uppercase', function(){

  it('works on strings with lowercase characters', function(){
    var values = {
      "a": "A",
      "aBc": "ABC",
      " A-Bc ": " A-BC ",
      "\nnewline \n ": "\nNEWLINE \n "
    };
    for (var key in values){
      var obj = {text:key};
      var validator = itsa.object({
        text: itsa.toUppercase()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid");
      assert.equal(obj.text, values[key], JSON.stringify(key));
    }
  });

  it('does not do anything to strings without lowercase or other values', function(){
    var values = [
      "ABC",
      "",
      "A B",
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
        text: itsa.toUppercase()
      });
      assert.equal(validator.validate(obj).valid, true, "Should be valid");
      assert.equal(obj.text, val, JSON.stringify(val));
    }
  });

});
