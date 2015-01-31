
var assert = require("chai").assert;
var itsa = require('../index');

describe('type classes', function(){

  it('identifies valid', function(){
    var examples = [
      [String, ""],
      [String, "red"],
      [Boolean, false],
      [Boolean, true],
      [Array, []],
      [Array, new Array()],
      [Number, 42],
      [Number, 0],
      [Object, {}],
      [Object, new Object()],
      [Date, new Date()],
      [Function, function(){}]
    ];
    for (var i=0; i<examples.length; i++){
      var example = examples[i];
      assert.equal(itsa.any(example[0]).validate(example[1]).valid, true, "Any-"+JSON.stringify(example[1]));
      assert.equal(itsa.object({val:example[0]}).validate({val:example[1]}).valid, true, "Object-"+JSON.stringify(example[1]));
      assert.equal(itsa.array([example[0]]).validate([example[1]]).valid, true, "Array-"+JSON.stringify(example[1]));
    }
  });

  it('identifies invalid', function(){
    var examples = [
      [String, null],
      [String, 0],
      [String, 1],
      [Boolean, 0],
      [Boolean, 1],
      [Boolean, null],
      [Boolean, undefined],
      [Array, {}],
      [Array, ""],
      [Array, null],
      [Array, undefined],
      [Array, 0],
      [Number, null],
      [Number, undefined],
      [Number, ""],
      [Number, []],
      [Number, {}],
      [Object, []],
      [Object, new String()],
      [Object, new Array()],
      [Object, new Date()],
      [Object, null],
      [Date, 0],
      [Date, new Date("invalid")],
      [Function, null]
    ];
    for (var i=0; i<examples.length; i++){
      var example = examples[i];
      assert.equal(itsa.any(example[0]).validate(example[1]).valid, false, JSON.stringify(example[1]));
      assert.equal(itsa.object({val:example[0]}).validate({val:example[1]}).valid, false, "Object-"+JSON.stringify(example[1]));
      assert.equal(itsa.array([example[0]]).validate([example[1]]).valid, false, "Array-"+JSON.stringify(example[1]));
    }
  });

});
