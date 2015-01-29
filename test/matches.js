
var assert = require("chai").assert;
var itsa = require('../index');

describe('matches', function(){

  it('throws with no regexp is given', function(){
    assert.throws(function(){ itsa.matches(); });
    assert.throws(function(){ itsa.matches("99"); });
    assert.throws(function(){ itsa.matches(42); });
  });

  it('identifies valid', function(){
    assert.equal(itsa.matches(/h.t/i).validate("hat").valid, true, "hat");
    assert.equal(itsa.matches(/h.t/i).validate("HAT").valid, true, "HAT");
    assert.equal(itsa.matches(/\d\d/).validate(99).valid, true, "99");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.matches(/h.t/i).validate("bat").valid, false, "hat");
  });

});
