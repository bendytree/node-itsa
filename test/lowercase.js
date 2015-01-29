
var assert = require("chai").assert;
var itsa = require('../index');

describe('lowercase', function(){

  it('identifies valid', function(){
    var values = [
      "",
      "-",
      "bob99",
      "a-b.99",
      "999"
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.lowercase().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "A",
      "A-",
      "bAob99",
      "a-B.99",
      "9C9",
      undefined, null, 0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.lowercase().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
