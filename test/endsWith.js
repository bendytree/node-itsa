
var assert = require("chai").assert;
var itsa = require('../index');

describe('endsWith', function(){

  it('identifies valid', function(){
    assert.equal(itsa.endsWith("red").validate("bigred").valid, true, "bigred");
    assert.equal(itsa.endsWith("").validate("klsjdf").valid, true, "klsjdf");
    assert.equal(itsa.endsWith(4).validate([2, 4]).valid, true, "4");
    assert.equal(itsa.endsWith(undefined).validate([null, undefined]).valid, true, "undefined");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.endsWith(undefined).validate([]).valid, false, "undefined");
    assert.equal(itsa.endsWith("blue").validate("redbird").valid, false, "blue");
    assert.equal(itsa.endsWith("blue").validate("bluebird").valid, false, "bigblue");
    assert.equal(itsa.endsWith(3).validate([2,4]).valid, false, "3");
    assert.equal(itsa.endsWith(2).validate([2,4]).valid, false, "2");
    assert.equal(itsa.endsWith(7).validate([]).valid, false, "7");
    assert.equal(itsa.endsWith(undefined).validate([2,4]).valid, false, "undefined");
    assert.equal(itsa.endsWith(null).validate([2,4]).valid, false, "null");
    assert.equal(itsa.endsWith(5).validate(null).valid, false, "5");
  });

  it('gets end length correct when mixing arrays and string', function(){
    assert.equal(itsa.endsWith("23").validate([2, 4, "23"]).valid, true, "valid");
    assert.equal(itsa.endsWith("23").validate([2, "23", 4]).valid, false, "invalid");
  });

  it('if data contains duplicates, then endsWith still works', function(){
    assert.equal(itsa.endsWith("23").validate("23-23").valid, true, "23-23");
    assert.equal(itsa.endsWith(42).validate([42, 42]).valid, true, "42, 42");
  });

});
