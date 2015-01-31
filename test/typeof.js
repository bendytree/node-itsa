
var assert = require("chai").assert;
var itsa = require('../index');

describe('typeof', function(){

  it('throws with no type given', function(){
    assert.throws(function(){
      itsa.typeof();
    });
  });

  it('throws when given type is not a string', function(){
    assert.throws(function(){
      itsa.typeof(42);
    });
  });


  it('identifies correct types', function(){
    var values = [
      { val: "abc", type: "string" },
      { val: {}, type: "object" },
      { val: [], type: "object" },
      { val: null, type: "object" },
      { val: new Date(), type: "object" },
      { val: function(){}, type: "function" },
      { val: undefined, type: "undefined" },
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.typeof(values[i].type).validate(values[i].val).valid, true, JSON.stringify(values[i].val));
    }
  });

  it('identifies invalid', function(){
    var values = [
      { val: "abc", type: "object" },
      { val: {}, type: "null" },
      { val: [], type: "array" },
      { val: null, type: "string" },
      { val: new Date(), type: "date" },
      { val: function(){}, type: "object" },
      { val: undefined, type: "null" },
    ];
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.typeof(values[i].type).validate(values[i].val).valid, false, JSON.stringify(values[i].val));
    }
  });

});
