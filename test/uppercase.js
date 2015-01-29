
var assert = require("chai").assert;
var itsa = require('../index');

describe('uppercase', function(){

  it('identifies valid', function(){
    var values = [
      "",
      "-",
      "BOB99",
      "A-B.99",
      "999"
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.uppercase().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "a",
      "a-",
      "bAob99",
      "a-B.99",
      "9c9",
      undefined, null, 0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.uppercase().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
