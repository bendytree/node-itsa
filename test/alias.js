
var assert = require("chai").assert;
var itsa = require('../index');

describe('alias', function(){

  it('aliases', function(){
    assert.equal(itsa.int, undefined, "`int` should start undefined");
    itsa.alias("integer", "int");
    assert.equal(itsa.int().validate(3).valid, true, "3 is an integer");
  });

  it('alias passes arguments', function(){
    assert.equal(itsa.upHigherThan, undefined, "`upHigherThan` should start undefined");
    itsa.alias("over", "upHigherThan");
    assert.equal(itsa.upHigherThan(3).validate(5).valid, true, "5 is up higher than 3");
  });

});
