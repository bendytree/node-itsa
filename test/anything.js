
var assert = require("chai").assert;
var itsa = require('../index');

describe('anything', function(){

  it('anything is valid', function(){
    var values = [
      false, true, 1, 0, -1, "", "Dog", new Date(), null, undefined, {}, {a:"b"}, [], [1,"hi"], function(){}
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.anything().validate(values[i]).valid, true, String(values[i]));
    }
  });

});
