
var assert = require("chai").assert;
var itsa = require('../index');

describe('contains', function(){

  it('identifies valid', function(){
    assert.equal(itsa.contains("red").validate("redbird").valid, true, "redbird");
    assert.equal(itsa.contains("red").validate("bigred").valid, true, "bigred");
    assert.equal(itsa.contains(2).validate([2, 4]).valid, true, "2");
    assert.equal(itsa.contains(4).validate([2, 4]).valid, true, "4");
    assert.equal(itsa.contains(null).validate([null, undefined]).valid, true, "null");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.contains("blue").validate("redbird").valid, false, "blue");
    assert.equal(itsa.contains(3).validate([2,4]).valid, false, "3");
    assert.equal(itsa.contains(7).validate([]).valid, false, "7");
    assert.equal(itsa.contains(null).validate([2,4]).valid, false, "null");
    assert.equal(itsa.contains(5).validate(null).valid, false, "5");
  });

});
