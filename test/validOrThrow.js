
var assert = require("chai").assert;
var itsa = require('../index');

describe('validOrThrow', function(){

  var doThing = function (criteria, callback) {
    //validate
    itsa.object({
      criteria: itsa.object(),
      callback: itsa.function()
    }).validOrThrow({
      criteria: criteria,
      callback: callback
    });

    //go on
  };

  it('throws with bad criteria', function(){
    assert.throws(function(){
      doThing(42);
    });
  });

  it('throws with no callback', function(){
    assert.throws(function(){
      doThing({});
    });
  });

  it('succeeds with correct arguments', function(){
    doThing({}, function(){});
  });

  it('can be called with unbound context', function(){
    var validOrThrow = itsa.string().validOrThrow;

    validOrThrow("Bob");

    assert.throws(function(){
      validOrThrow(42);
    });
  });

});
