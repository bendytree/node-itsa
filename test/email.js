
var assert = require("chai").assert;
var itsa = require('../index');

describe('email', function(){

  it('identifies valid', function(){
    var values = [
      "bob@example.com",
      "a.b+1@example.co",
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.email().validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      "bob@example",
      "bob example.com",
      " bob@example.com",
      "bob@example.com ",
      "Bob <bob@example.com>",
      "<bob@example.com>",
      undefined, null, 0
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.email().validate(values[i]).valid, false, String(values[i]));
    }
  });

});
