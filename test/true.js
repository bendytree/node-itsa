
var assert = require("chai").assert;
var itsa = require('../index');

describe('true', function(){

  it('identifies valid', function(){
    var values = [
      true
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.true().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      1,
      "red",
      []
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.true().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
