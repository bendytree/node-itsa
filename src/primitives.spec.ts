
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('primitives', function() {

    it('validates raw numbers in an object', function() {
      assert.strictEqual(itsa.object({a:1}).validate({a:1}).ok, true);
      assert.strictEqual(itsa.object({a:2}).validate({a:1}).ok, false);
    });

    it('validates raw strings in an object', function() {
      assert.strictEqual(itsa.object({a:'x'}).validate({a:'x'}).ok, true);
      assert.strictEqual(itsa.object({a:'x'}).validate({a:'y'}).ok, false);
    });

    it('validates raw bools in an object', function() {
      assert.strictEqual(itsa.object({a:true}).validate({a:true}).ok, true);
      assert.strictEqual(itsa.object({a:true}).validate({a:false}).ok, false);
    });

    it('validates raw null and undefined in an object', function() {
      assert.strictEqual(itsa.object({a:null}).validate({a:null}).ok, true);
      assert.strictEqual(itsa.object({a:null}).validate({a:undefined}).ok, false);
      assert.strictEqual(itsa.object({a:undefined}).validate({a:undefined}).ok, true);
      assert.strictEqual(itsa.object({a:undefined}).validate({a:null}).ok, false);
    });

    it('is strict by default', function() {
      assert.strictEqual(itsa.object({a:'1'}).validate({a:1}).ok, false);
      assert.strictEqual(itsa.object({a:null}).validate({a:undefined}).ok, false);
    });

    it('also works in any()', function() {
      assert.strictEqual(itsa.any(1, 2, 3).validate(1).ok, true);
      assert.strictEqual(itsa.any(1, 2, 3).validate(2).ok, true);
      assert.strictEqual(itsa.any(1, 2, 3).validate(4).ok, false);
    });

    it('strings work in any()', function() {
      assert.strictEqual(itsa.any('red', 'green', 'blue').validate('red').ok, true);
      assert.strictEqual(itsa.any('red', 'green', 'blue').validate('yellow').ok, false);
    });

    it('works with mixed types', function() {
      assert.strictEqual(itsa.any('red', 3, false).validate('red').ok, true);
      assert.strictEqual(itsa.any('red', 3, false).validate(3).ok, true);
      assert.strictEqual(itsa.any('red', 3, false).validate(false).ok, true);
      assert.strictEqual(itsa.any('red', 3, false).validate(true).ok, false);
      assert.strictEqual(itsa.any('red', 3, false).validate(5).ok, false);
    });

    it('validates classes too', function() {
      assert.strictEqual(itsa.object({a:String}).validate({a:'foo'}).ok, true);
      assert.strictEqual(itsa.object({a:Number}).validate({a:1}).ok, true);
      assert.strictEqual(itsa.object({a:Date}).validate({a:new Date()}).ok, true);
      assert.strictEqual(itsa.object({a:RegExp}).validate({a:/x/}).ok, true);
      assert.strictEqual(itsa.object({a:Object}).validate({a:{y:'z'}}).ok, true);
      assert.strictEqual(itsa.object({a:Boolean}).validate({a:false}).ok, true);
      assert.strictEqual(itsa.object({a:Function}).validate({a:() => {}}).ok, true);
      assert.strictEqual(itsa.object({a:Array}).validate({a:[]}).ok, true);
    });

    it('invalidates classes too', function() {
      assert.strictEqual(itsa.object({a:String}).validate({a:2}).ok, false);
      assert.strictEqual(itsa.object({a:Number}).validate({a:'foo'}).ok, false);
      assert.strictEqual(itsa.object({a:Date}).validate({a:/x/}).ok, false);
      assert.strictEqual(itsa.object({a:RegExp}).validate({a:new Date()}).ok, false);
      assert.strictEqual(itsa.object({a:Object}).validate({a:true}).ok, false);
      assert.strictEqual(itsa.object({a:Boolean}).validate({a:3}).ok, false);
      assert.strictEqual(itsa.object({a:Function}).validate({a:{y:'z'}}).ok, false);
      assert.strictEqual(itsa.object({a:Array}).validate({a:{}}).ok, false);
    });

  });

});
