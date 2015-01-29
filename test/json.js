
var assert = require("chai").assert;
var itsa = require('../index');

describe('json', function(){

  it('identifies valid', function(){
    var values = [
      "{}",
      "[]"
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.json().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      "[a",
      "-",
      undefined, null, 0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.json().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
