
var assert = require("chai").assert;
var itsa = require('../index');

describe('to-string', function(){

  it('converts anything to a string', function(){
    var convert = function (val) {
      var obj = {val:val};
      itsa.object({
        val: itsa.toString()
      }).validate(obj);
      return obj.val;
    };

    assert.equal(convert("Bob"), "Bob");
    assert.equal(convert(42), "42");
    assert.equal(convert(), "undefined");
    assert.equal(convert(undefined), "undefined");
    assert.equal(convert(null), "null");
    assert.equal(convert([]), "");
    assert.equal(convert([1,2]), "1,2");
    assert.equal(convert({a:1}), "[object Object]");
  });

});
