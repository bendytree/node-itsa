
var assert = require("chai").assert;
var itsa = require('../index');

describe('before', function(){

  it('is an alias of `under`', function(){
    assert.equal(itsa.before(3).validate(2).valid, true, "2");
  });

});
