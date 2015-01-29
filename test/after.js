
var assert = require("chai").assert;
var itsa = require('../index');

describe('after', function(){

  it('is an alias of `over`', function(){
    assert.equal(itsa.after(3).validate(5).valid, true, "5");
  });

});
