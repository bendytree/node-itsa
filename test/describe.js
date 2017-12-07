
var assert = require("chai").assert;
var itsa = require('../index');

describe('describe', function(){

  it('describes the result', function(){
    assert.equal(itsa.object({
      a:itsa.string().msg("a-error"),
      b:itsa.string().msg("b-error")
    }).validate({}).describe(), "a-error\nb-error", "all errors");
  });

  it('describes the first error', function(){
    assert.equal(itsa.object({
      a:itsa.string().msg("a-error"),
      b:itsa.string().msg("b-error")
    }).validate({}).describe(true), "a-error", "first errors");
  });

});
