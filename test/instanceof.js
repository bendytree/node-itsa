
var assert = require("chai").assert;
var itsa = require('../index');

describe('instanceof', function(){

  it('throws with no class given', function(){
    assert.throws(function(){
      itsa.instanceof();
    });
  });

  it('throws when given type is not a function', function(){
    assert.throws(function(){
      itsa.instanceof(42);
    });
  });


  it('identifies correct types', function(){
    var values = [
      { val: {}, cls: Object },
      { val: [], cls: Array },
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.instanceof(values[i].cls).validate(values[i].val).valid, true, JSON.stringify(values[i].val));
    }
  });

  it('identifies invalid', function(){
    var values = [
      { val: 42, cls: Number },
      { val: "abc", cls: String },
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.instanceof(values[i].cls).validate(values[i].val).valid, false, JSON.stringify(values[i].val));
    }
  });

  it('identifies custom classes', function(){
    var User = function () { };
    var user = new User();

    assert.equal(itsa.instanceof(User).validate(user).valid, true, "user");
    assert.equal(itsa.instanceof(User).validate(null).valid, false, "null");
    assert.equal(itsa.instanceof(User).validate({}).valid, false, "{}");
  });

});
