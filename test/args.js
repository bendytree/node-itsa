
var assert = require("chai").assert;
var itsa = require('../index');

describe('args', function(){

  it('identifies arguments', function(){
    (function(){
      assert.equal(itsa.args().validate(arguments).valid, true, "Empty arguments");
    })();

    (function(){
      assert.equal(itsa.args().validate(arguments).valid, true, "42, red");
    })(42, "red");
  });

  it('identifies invalid arguments', function(){
    assert.equal(itsa.args().validate().valid, false, "No arg");
    assert.equal(itsa.args().validate({}).valid, false, "object");
    assert.equal(itsa.args().validate([]).valid, false, "[]");
  });

  it('example parameter must be an array if it is given', function(){
    assert.throws(function(){ itsa.args(null); });
    assert.throws(function(){ itsa.args(undefined); });
    assert.throws(function(){ itsa.args({}); });
    assert.throws(function(){ itsa.args("abc"); });
    itsa.args([]);
  });

  it('if example is given then items must match (valid case)', function(){
    (function(){
      assert.equal(itsa.args([
        itsa.number(),
        itsa.string()
      ]).validate(arguments).valid, true);
    })(42, "red");
  });

  it('if example is given then items must match (bad types)', function(){
    (function(){
      assert.equal(itsa.args([
        itsa.number(),
        itsa.string()
      ]).validate(arguments).valid, false);
    })("blue", "red");
  });

  it('if example is given then items must match (too many arguments)', function(){
    (function(){
      assert.equal(itsa.args([
        itsa.string(),
        itsa.string()
      ]).validate(arguments).valid, false);
    })("blue", "red", "white");
  });

  it('if example is given then items must match (allowe extra arguments)', function(){
    (function(){
      assert.equal(itsa.args([
        itsa.string(),
        itsa.string()
      ], true).validate(arguments).valid, true);
    })("blue", "red", "white");
  });

  it('if no example is given then items are not validated', function(){
    (function(){
      assert.equal(itsa.args().validate(arguments).valid, true);
    })("blue", "red", "white");
  });

  it('default values can be used in arguments', function(){
    (function(){
      var result = itsa.args([
        itsa.default("red").string(),
        itsa.default("blue").string(),
      ]).validate(arguments);
      assert.equal(result.valid, true, "valid");
      assert.equal(arguments[0], "red", "red");
      assert.equal(arguments[1], "blue", "blud");
    })(0);
  });

  it('update values can be used in argumentss', function(){
    (function(){
      var result = itsa.args([
        itsa.to("red").string()
      ]).validate(arguments);
      assert.equal(result.valid, true, "valid");
      assert.equal(arguments[0], "red");
    })("blue");
  });

});
