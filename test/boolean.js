
var assert = require("chai").assert;
var itsa = require('../index');

describe('boolean', function(){

  it('identifies valid', function(){
    assert.equal(itsa.boolean().validate(true).valid, true, "true");
    assert.equal(itsa.boolean().validate(false).valid, true, "false");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.boolean().validate(1).valid, false, "1");
    assert.equal(itsa.boolean().validate(0).valid, false, "0");
  });

});
