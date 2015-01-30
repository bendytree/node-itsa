
var assert = require("chai").assert;
var itsa = require('../index');

describe('unique-getter', function(){

  it('identifies valid', function(){
    var values = [
      [],
      [{id:1},{id:2}],
      [{id:1},{id:true}],
      [{id:"a"},{id:"b"}],
      {},
      {a:{id:1},b:{id:2}},
      {a:{id:1},b:{id:true}},
      {a:{id:"a"},b:{id:"b"}}
    ];
    var getter = function(obj){ return obj.id; };
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.unique(getter).validate(values[i]).valid, true, String(values[i]));
    }
  });

  it('identifies invalid', function(){
    var values = [
      [{id:1},{id:1}],
      {a:{id:1},b:{id:1}}
    ];
    var getter = function(obj){ return obj.id; };
    for(var i=0; i<values.length; i++) {
      assert.equal(itsa.unique(getter).validate(values[i]).valid, false, String(values[i]));
    }
  });

});
