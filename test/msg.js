
var assert = require("chai").assert;
var itsa = require('../index');

describe('msg', function(){

  it('custom error message works', function(){
    assert.equal(itsa.string().minLength(1).msg("foo").validate("").describe(), "foo", "string and minLength");
    assert.equal(itsa.notEmpty().msg("foo").validate("").describe(), "foo", "notEmpty");
    assert.equal(itsa.object({a:itsa.string().notEmpty().msg("foo")}).validate({a:""}).describe(), "foo", "object.a.notEmpty");
  });

});
