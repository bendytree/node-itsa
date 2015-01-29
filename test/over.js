
var assert = require("chai").assert;
var itsa = require('../index');

describe('over', function(){

  it('valid, exclusive', function(){
    assert.equal(itsa.over(5).validate(8).valid, true, "8");
    assert.equal(itsa.over(new Date(1222563421430)).validate(new Date(1322563421430)).valid, true, "new Date(1322563421430)");
    assert.equal(itsa.over("b").validate("c").valid, true, "c");
  });

  it('invalid, exclusive', function(){
    assert.equal(itsa.over(5).validate(3).valid, false, "3");
    assert.equal(itsa.over(5).validate(5).valid, false, "5");
    assert.equal(itsa.over(new Date(1322563421430)).validate(new Date(1222563421430)).valid, false, "new Date(1222563421430)");
    assert.equal(itsa.over(new Date(1322563421430)).validate(new Date(1322563421430)).valid, false, "new Date(1322563421430)");
    assert.equal(itsa.over("c").validate("b").valid, false, "b");
    assert.equal(itsa.over("c").validate("c").valid, false, "c");
  });

  it('valid, inclusive', function(){
    assert.equal(itsa.over(5, true).validate(8).valid, true, "8");
    assert.equal(itsa.over(5, true).validate(5).valid, true, "5");
    assert.equal(itsa.over(new Date(1322563421430), true).validate(new Date(1322563421430)).valid, true, "new Date(1322563421430)");
    assert.equal(itsa.over("c", true).validate("c").valid, true, "c");
  });

  it('invalid, inclusive', function(){
    assert.equal(itsa.over(5, true).validate(3).valid, false, "3");
    assert.equal(itsa.over(new Date(1322563421430), true).validate(new Date(1222563421430)).valid, false, "new Date(1222563421430)");
    assert.equal(itsa.over("c", true).validate("b").valid, false, "b");
  });

});
