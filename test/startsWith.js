
var assert = require("chai").assert;
var itsa = require('../index');

describe('startsWith', function(){

  it('identifies valid', function(){
    assert.equal(itsa.startsWith("red").validate("redbird").valid, true, "redbird");
    assert.equal(itsa.startsWith("").validate("klsjdf").valid, true, "klsjdf");
    assert.equal(itsa.startsWith(2).validate([2, 4]).valid, true, "2");
    assert.equal(itsa.startsWith(null).validate([null, undefined]).valid, true, "null");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.startsWith(undefined).validate([]).valid, false, "undefined");
    assert.equal(itsa.startsWith("blue").validate("redbird").valid, false, "blue");
    assert.equal(itsa.startsWith("blue").validate("bigblue").valid, false, "bigblue");
    assert.equal(itsa.startsWith(3).validate([2,4]).valid, false, "3");
    assert.equal(itsa.startsWith(4).validate([2,4]).valid, false, "4");
    assert.equal(itsa.startsWith(7).validate([]).valid, false, "7");
    assert.equal(itsa.startsWith(undefined).validate([2,4]).valid, false, "undefined");
    assert.equal(itsa.startsWith(null).validate([2,4]).valid, false, "null");
    assert.equal(itsa.startsWith(5).validate(null).valid, false, "5");
  });

});
