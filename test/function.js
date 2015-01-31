
var assert = require("chai").assert;
var itsa = require('../index');

describe('function', function(){

  it('identifies valid', function(){
    assert.equal(itsa.function().validate(function(){}).valid, true, "empty function");
    assert.equal(itsa.function().validate(function doThing(a,b){ return false; }).valid, true, "named function");
  });

  it('identifies invalid', function(){
    assert.equal(itsa.function().validate(1).valid, false, "1");
    assert.equal(itsa.function().validate(0).valid, false, "0");
    assert.equal(itsa.function().validate().valid, false, "nothing");
    assert.equal(itsa.function().validate(undefined).valid, false, "undefined");
    assert.equal(itsa.function().validate(null).valid, false, "null");
    assert.equal(itsa.function().validate("").valid, false, "blank string");
    assert.equal(itsa.function().validate("abc").valid, false, "abc");
  });

  it('identifies valid field', function(){
    var user = {
      birthday: new Date(new Date().getTime() - 1000*60*60*24*365*3.5),
      age: function(){
        return Math.floor((new Date().getTime() - this.birthday) / (1000*60*60*24*365));
      }
    };
    var valid = itsa.object({
      birthday: itsa.date(),
      age: itsa.function()
    }).validate(user).valid;
    assert.equal(valid, true, "age is a valid function");
  });

  it('identifies invalid field', function(){
    var user = {
      birthday: new Date(new Date().getTime() - 1000*60*60*24*365*3.5),
      age: function(){
        return Math.floor((new Date().getTime() - this.birthday) / (1000*60*60*24*365));
      }
    };
    var valid = itsa.object({
      birthday: itsa.date(),
      age: "young"
    }).validate(user).valid;
    assert.equal(valid, false, "age is not a function");
  });

  it('identifies valid array item', function(){
    var data = [
      "red",
      function(){ return 42; }
    ];
    var valid = itsa.array([
      itsa.string(),
      itsa.function()
    ]).validate(data).valid;
    assert.equal(valid, true, "item 2 is a valid function");
  });

  it('identifies valid arrayOf item', function(){
    var data = [
      "red",
      function(){ return 42; }
    ];
    var result = itsa.arrayOf(itsa.any(itsa.string(), itsa.function())).validate(data);
    assert.equal(result.valid, true, result.describe());
  });

});
