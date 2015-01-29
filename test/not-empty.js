
var assert = require("chai").assert;
var itsa = require('../index');

describe('not-empty', function(){

  it('identifies valid', function(){
    var values = [
      "red", [42], {name:"Bob"}
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.notEmpty().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "",
      [],
      {},
      1,
      true
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.notEmpty().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
