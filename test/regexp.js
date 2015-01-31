
var assert = require("chai").assert;
var itsa = require('../index');

describe('regexp', function(){

  it('identifies valid', function(){
    var values = [
      /a+/,
      //,
      /./gi,
      new RegExp("a+", "i")
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.regexp().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      true,
      1,
      "red",
      []
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.regexp().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
