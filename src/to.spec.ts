
import assert from 'assert';
import { describe, it } from 'mocha';
import { itsa } from "./index";

describe('itsa', function() {
  describe('to', function() {
    it('to is an alias of convert', function() {
      const obj = { a: 3 };
      assert.strictEqual(itsa.object({a:itsa.to(v => v * 2)}).validate(obj).ok, true);
      assert.strictEqual(obj.a, 6);
    });
  });

  describe('other converters', function() {
    it('toDate', function() {
      const obj = { a: "2012/03/13" as any };
      itsa.object({a:itsa.toDate()}).validate(obj);
      assert.strictEqual(obj.a.getTime(), new Date("2012/03/13").getTime());
    });

    it('toDate invalid string', function() {
      const obj = { a: "blue" as any };
      assert.strictEqual(itsa.object({a:itsa.toDate()}).validate(obj).ok, false);
    });

    it('toFloat', function() {
      const obj = { a: "23.45" };
      itsa.object({a:itsa.toFloat()}).validate(obj);
      assert.strictEqual(obj.a, 23.45);
    });

    it('toFloat invalid', function() {
      const obj = { a: "pink" };
      assert.strictEqual(itsa.object({a:itsa.toFloat()}).validate(obj).ok, false);
    });

    it('toInt', function() {
      const obj = { a: "23.45" };
      itsa.object({a:itsa.toInt()}).validate(obj);
      assert.strictEqual(obj.a, 23);
    });

    it('toInt invalid', function() {
      const obj = { a: "yellow" };
      assert.strictEqual(itsa.object({a:itsa.toInt()}).validate(obj).ok, false);
    });

    it('toLowerCase', function() {
      const obj = { a: "Bob" };
      itsa.object({a:itsa.toLowerCase()}).validate(obj);
      assert.strictEqual(obj.a, 'bob');
    });

    it('toUpperCase', function() {
      const obj = { a: "Bob" };
      itsa.object({a:itsa.toUpperCase()}).validate(obj);
      assert.strictEqual(obj.a, 'BOB');
    });

    it('toNow', function() {
      const now = Date.now();
      const obj = { a: null };
      itsa.object({a:itsa.toNow()}).validate(obj);
      assert.strictEqual(obj.a.getTime() >= now, true);
    });

    it('toString', function() {
      const obj = { a: 23 };
      itsa.object({a:itsa.toString()}).validate(obj);
      assert.strictEqual(obj.a, '23');
    });

    it('toTrimmed', function() {
      const obj = { a: ' 23 ' };
      itsa.object({a:itsa.toTrimmed()}).validate(obj);
      assert.strictEqual(obj.a, '23');
    });
  });
});
