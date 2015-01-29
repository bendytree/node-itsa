
var assert = require("chai").assert;
var itsa = require('../index');

describe('empty', function(){

  it('identifies valid', function(){
    assert.equal(itsa.empty().validate([]).valid, true, "[]");
    assert.equal(itsa.empty().validate({}).valid, true, "{}");
    assert.equal(itsa.empty().validate("").valid, true, "blank string");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.empty().validate(null).valid, false, "null");
    assert.equal(itsa.empty().validate(undefined).valid, false, "undefined");
    assert.equal(itsa.empty().validate(42).valid, false, "42");
    assert.equal(itsa.empty().validate(new Date()).valid, false, "new Date()");
    assert.equal(itsa.empty().validate([42]).valid, false, "[42]");
    assert.equal(itsa.empty().validate([undefined]).valid, false, "[undefined]");
    assert.equal(itsa.empty().validate({name:"Bob"}).valid, false, "{name:Bob}");
    assert.equal(itsa.empty().validate("red").valid, false, "red");
  });

});
