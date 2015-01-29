
var assert = require("chai").assert;
var itsa = require('../index');

describe('under', function(){

  it('valid, exclusive', function(){
    assert.equal(itsa.under(5).validate(3).valid, true, "3");
    assert.equal(itsa.under(new Date(1322563421430)).validate(new Date(1222563421430)).valid, true, "new Date(1222563421430)");
    assert.equal(itsa.under("c").validate("b").valid, true, "b");
  });

  it('invalid, exclusive', function(){
    assert.equal(itsa.under(5).validate(8).valid, false, "8");
    assert.equal(itsa.under(5).validate(5).valid, false, "5");
    assert.equal(itsa.under(new Date(1222563421430)).validate(new Date(1322563421430)).valid, false, "new Date(1222563421430)");
    assert.equal(itsa.under(new Date(1322563421430)).validate(new Date(1322563421430)).valid, false, "new Date(1322563421430)");
    assert.equal(itsa.under("b").validate("c").valid, false, "c");
    assert.equal(itsa.under("c").validate("c").valid, false, "c");
  });

  it('valid, inclusive', function(){
    assert.equal(itsa.under(5, true).validate(3).valid, true, "3");
    assert.equal(itsa.under(5, true).validate(5).valid, true, "5");
    assert.equal(itsa.under(new Date(1322563421430), true).validate(new Date(1322563421430)).valid, true, "new Date(1322563421430)");
    assert.equal(itsa.under("c", true).validate("c").valid, true, "c");
  });

  it('invalid, inclusive', function(){
    assert.equal(itsa.under(1, true).validate(3).valid, false, "3");
    assert.equal(itsa.under(new Date(1222563421430), true).validate(new Date(1322563421430)).valid, false, "new Date(1222563421430)");
    assert.equal(itsa.under("b", true).validate("c").valid, false, "b");
  });

});
