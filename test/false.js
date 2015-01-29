
var assert = require("chai").assert;
var itsa = require('../index');

describe('false', function(){

  it('identifies valid', function(){
    var values = [
      false
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.false().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      0,
      undefined,
      null,
      "",
      [],
      NaN
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.false().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
