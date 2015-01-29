
var assert = require("chai").assert;
var itsa = require('../index');

describe('between', function(){

  it('valid, exclusive', function(){
    assert.equal(itsa.between(1, 3).validate(2).valid, true, "2");
    assert.equal(itsa.between("a", "c").validate("b").valid, true, "b");
    assert.equal(itsa.between(new Date(1300000000000), new Date(1500000000000)).validate(new Date(1400000000000)).valid, true, "Date");
  });

  it('invalid, exclusive', function(){
    assert.equal(itsa.between(1, 3).validate(3).valid, false, "3");
    assert.equal(itsa.between(1, 3).validate(8).valid, false, "8");
    assert.equal(itsa.between(1, 3).validate(0).valid, false, "0");
    assert.equal(itsa.between("a", "c").validate("a").valid, false, "c");
    assert.equal(itsa.between(new Date(1300000000000), new Date(1500000000000)).validate(new Date(1500000000000)).valid, false, "Date");
  });

  it('valid, inclusive', function(){
    assert.equal(itsa.between(1, 3, true).validate(2).valid, true, "2");
    assert.equal(itsa.between(1, 3, true).validate(3).valid, true, "3");
    assert.equal(itsa.between("a", "c", true).validate("a").valid, true, "c");
    assert.equal(itsa.between(new Date(1300000000000), new Date(1500000000000), true).validate(new Date(1500000000000)).valid, true, "Date");
  });

  it('invalid, inclusive', function(){
    assert.equal(itsa.between(1, 3, true).validate(8).valid, false, "8");
    assert.equal(itsa.between(1, 3, true).validate(0).valid, false, "0");
    assert.equal(itsa.between("a", "c").validate("d").valid, false, "d");
    assert.equal(itsa.between(new Date(1300000000000), new Date(1500000000000), true).validate(new Date(1600000000000)).valid, false, "Date");
  });

});
