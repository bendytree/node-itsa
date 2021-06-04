/*!
 * @license
 * itsa 2.1.65
 * Copyright 2021 Josh Wright <https://www.joshwright.com>
 * MIT LICENSE
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ItsaLib"] = factory();
	else
		root["ItsaLib"] = factory();
})(this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 970:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var itsa_1 = __webpack_require__(589);

var helpers_1 = __webpack_require__(28);

var ItsaAny = /*#__PURE__*/function () {
  function ItsaAny() {
    _classCallCheck(this, ItsaAny);
  }

  _createClass(ItsaAny, [{
    key: "any",
    value: function any() {
      for (var _len = arguments.length, options = new Array(_len), _key = 0; _key < _len; _key++) {
        options[_key] = arguments[_key];
      }

      var schemas = options.flat().map(function (x) {
        return helpers_1.primitiveToItsa(x);
      });
      var settings = {
        schemas: schemas
      };
      this.predicates.push({
        id: 'any',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaAny;
}();

var validate = {
  id: 'any',
  validate: function validate(context, settings) {
    var key = context.key,
        val = context.val,
        parent = context.parent,
        validation = context.validation,
        exists = context.exists,
        result = context.result;
    var schemas = settings.schemas;
    if (schemas.length === 0) return;

    var _iterator = _createForOfIteratorHelper(schemas),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var subSchema = _step.value;

        var subResult = subSchema._validate({
          key: key,
          parent: parent,
          val: val,
          exists: exists,
          settings: validation,
          path: context.path
        });

        if (subResult.ok) {
          return;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    result.registerError("No schemas matched.");
  }
};
itsa_1.Itsa.extend(ItsaAny, validate);

/***/ }),

/***/ 776:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaAnything = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaAnything = /*#__PURE__*/function () {
  function ItsaAnything() {
    _classCallCheck(this, ItsaAnything);
  }

  _createClass(ItsaAnything, [{
    key: "anything",
    value: function anything() {
      this.predicates.push({
        id: 'anything',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaAnything;
}();

exports.ItsaAnything = ItsaAnything;
itsa_1.Itsa.extend(ItsaAnything, {
  id: 'anything',
  validate: function validate(context) {}
});

/***/ }),

/***/ 911:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaArray = void 0;

var itsa_1 = __webpack_require__(589);

var helpers_1 = __webpack_require__(28);

var ItsaArray = /*#__PURE__*/function () {
  function ItsaArray() {
    _classCallCheck(this, ItsaArray);
  }

  _createClass(ItsaArray, [{
    key: "array",
    value: function array(example) {
      var settings = {
        example: example ? helpers_1.primitiveToItsa(example) : null
      };
      this.predicates.push({
        id: 'array',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaArray;
}();

exports.ItsaArray = ItsaArray;
itsa_1.Itsa.extend(ItsaArray, {
  id: 'array',
  validate: function validate(context, settings) {
    var val = context.val,
        validation = context.validation,
        exists = context.exists,
        result = context.result,
        type = context.type;
    var example = settings.example;
    if (!Array.isArray(val)) return result.registerError("Expected array but found ".concat(type));
    if (!example) return;
    if (!val.length) return;

    for (var key = 0; key < val.length; key++) {
      var subVal = val[key];

      var subResult = example._validate({
        key: key,
        parent: val,
        val: subVal,
        exists: exists,
        settings: validation,
        path: [].concat(_toConsumableArray(context.path), [key])
      });

      result.registerResult(subResult);
    }
  }
});

/***/ }),

/***/ 850:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaBetween = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaBetween = /*#__PURE__*/function () {
  function ItsaBetween() {
    _classCallCheck(this, ItsaBetween);
  }

  _createClass(ItsaBetween, [{
    key: "between",
    value: function between(min, max) {
      var extraSettings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var settings = extraSettings;
      settings.min = min;
      settings.max = max;
      this.predicates.push({
        id: 'between',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaBetween;
}();

exports.ItsaBetween = ItsaBetween;
itsa_1.Itsa.extend(ItsaBetween, {
  id: 'between',
  validate: function validate(context, settings) {
    var _settings$inclusive;

    var val = context.val,
        result = context.result;
    var min = settings.min,
        max = settings.max;
    var inclusive = (_settings$inclusive = settings.inclusive) !== null && _settings$inclusive !== void 0 ? _settings$inclusive : true;
    var isTooLow = inclusive ? val < min : val <= min;
    if (isTooLow) result.registerError("Value cannot be under ".concat(min));
    var isTooHigh = inclusive ? val > max : val >= max;
    if (isTooHigh) result.registerError("Value cannot be above ".concat(max));
  }
});

/***/ }),

/***/ 233:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaBoolean = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaBoolean = /*#__PURE__*/function () {
  function ItsaBoolean() {
    _classCallCheck(this, ItsaBoolean);
  }

  _createClass(ItsaBoolean, [{
    key: "boolean",
    value: function boolean() {
      this.predicates.push({
        id: 'boolean',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaBoolean;
}();

exports.ItsaBoolean = ItsaBoolean;
itsa_1.Itsa.extend(ItsaBoolean, {
  id: 'boolean',
  validate: function validate(context) {
    var type = context.type,
        result = context.result;
    if (type !== 'boolean') result.registerError("Expected bool but found ".concat(type));
  }
});

/***/ }),

/***/ 758:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaClone = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaClone = /*#__PURE__*/function () {
  function ItsaClone() {
    _classCallCheck(this, ItsaClone);
  }

  _createClass(ItsaClone, [{
    key: "clone",
    value: function clone() {
      var raw = JSON.parse(JSON.stringify(this));
      return itsa_1.itsa.load(raw);
    }
  }]);

  return ItsaClone;
}();

exports.ItsaClone = ItsaClone;
itsa_1.Itsa.extend(ItsaClone);

/***/ }),

/***/ 438:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaConstructor = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaConstructor = /*#__PURE__*/function () {
  function ItsaConstructor() {
    _classCallCheck(this, ItsaConstructor);
  }

  _createClass(ItsaConstructor, [{
    key: "constructorIs",
    value: function constructorIs(cls) {
      var settings = {
        cls: cls
      };
      this.predicates.push({
        id: 'constructor',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaConstructor;
}();

exports.ItsaConstructor = ItsaConstructor;
itsa_1.Itsa.extend(ItsaConstructor, {
  id: 'constructor',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
    if (!isMatch) return result.registerError("Expected to be ".concat(settings.cls));
  }
});

/***/ }),

/***/ 801:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaConvert = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaConvert = /*#__PURE__*/function () {
  function ItsaConvert() {
    _classCallCheck(this, ItsaConvert);
  }

  _createClass(ItsaConvert, [{
    key: "convert",
    value: function convert(converter) {
      var settings = {
        converter: converter
      };
      this.predicates.push({
        id: 'convert',
        settings: settings
      });
      return this;
    }
  }, {
    key: "to",
    value: function to(converter) {
      var settings = {
        converter: converter
      };
      this.predicates.push({
        id: 'convert',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaConvert;
}();

exports.ItsaConvert = ItsaConvert;
itsa_1.Itsa.extend(ItsaConvert, {
  id: 'convert',
  validate: function validate(context, settings) {
    var val = context.val,
        setVal = context.setVal,
        result = context.result;
    var converter = settings.converter;
    if (typeof converter !== 'function') return;

    try {
      var newVal = converter(val);
      setVal(newVal);
    } catch (e) {
      result.registerError(e);
    }
  }
});

/***/ }),

/***/ 228:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaDate = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaDate = /*#__PURE__*/function () {
  function ItsaDate() {
    _classCallCheck(this, ItsaDate);
  }

  _createClass(ItsaDate, [{
    key: "date",
    value: function date() {
      this.predicates.push({
        id: 'date',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaDate;
}();

exports.ItsaDate = ItsaDate;
itsa_1.Itsa.extend(ItsaDate, {
  id: 'date',
  validate: function validate(context) {
    var val = context.val,
        result = context.result;
    var type = Object.prototype.toString.call(val);

    if (type !== "[object Date]") {
      return result.registerError("Expected date but found ".concat(type));
    }

    if (!isFinite(val)) {
      result.registerError("Date is not valid");
    }
  }
});

/***/ }),

/***/ 735:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var _itsa_1$Itsa;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaDefault = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaDefault = /*#__PURE__*/function () {
  function ItsaDefault() {
    _classCallCheck(this, ItsaDefault);
  }

  _createClass(ItsaDefault, [{
    key: "default",
    value: function _default(val) {
      var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      settings.val = val;
      this.predicates.push({
        id: 'default',
        settings: settings
      });
      return this;
    }
  }, {
    key: "defaultNow",
    value: function defaultNow() {
      this.predicates.push({
        id: 'defaultNow',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaDefault;
}();

exports.ItsaDefault = ItsaDefault;

(_itsa_1$Itsa = itsa_1.Itsa).extend.apply(_itsa_1$Itsa, [ItsaDefault].concat([{
  id: 'default',
  validate: function validate(context, settings) {
    var _settings$falsy;

    var val = context.val,
        setVal = context.setVal;
    var falsy = (_settings$falsy = settings.falsy) !== null && _settings$falsy !== void 0 ? _settings$falsy : false;
    var doReplace = falsy ? !val : val === null || val === undefined;

    if (doReplace) {
      setVal(settings.val);
    }
  }
}, {
  id: 'defaultNow',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal;

    if (val === null || val === undefined) {
      setVal(new Date());
    }
  }
}]));

/***/ }),

/***/ 609:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaEmail = void 0;

var itsa_1 = __webpack_require__(589);

var rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var ItsaEmail = /*#__PURE__*/function () {
  function ItsaEmail() {
    _classCallCheck(this, ItsaEmail);
  }

  _createClass(ItsaEmail, [{
    key: "email",
    value: function email() {
      this.predicates.push({
        id: 'email',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaEmail;
}();

exports.ItsaEmail = ItsaEmail;
itsa_1.Itsa.extend(ItsaEmail, {
  id: 'email',
  validate: function validate(context) {
    var val = context.val,
        type = context.type,
        result = context.result;
    if (type !== 'string') return result.registerError("Expected email but found ".concat(type));
    var isValid = rx.test(val);

    if (!isValid) {
      result.registerError('Email address is invalid');
    }
  }
});

/***/ }),

/***/ 151:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaEqual = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaEqual = /*#__PURE__*/function () {
  function ItsaEqual() {
    _classCallCheck(this, ItsaEqual);
  }

  _createClass(ItsaEqual, [{
    key: "equal",
    value: function equal(val) {
      var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      settings.example = val;
      this.predicates.push({
        id: 'equal',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaEqual;
}();

exports.ItsaEqual = ItsaEqual;
itsa_1.Itsa.extend(ItsaEqual, {
  id: 'equal',
  validate: function validate(context, settings) {
    var _settings$strict;

    var val = context.val,
        result = context.result;
    var example = settings.example;
    var strict = (_settings$strict = settings.strict) !== null && _settings$strict !== void 0 ? _settings$strict : true;
    var isEqual = strict ? val === example : val == example;

    if (!isEqual) {
      result.registerError("Did not equal ".concat(example));
    }
  }
});

/***/ }),

/***/ 947:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaFalsy = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaFalsy = /*#__PURE__*/function () {
  function ItsaFalsy() {
    _classCallCheck(this, ItsaFalsy);
  }

  _createClass(ItsaFalsy, [{
    key: "falsy",
    value: function falsy() {
      this.predicates.push({
        id: 'falsy',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaFalsy;
}();

exports.ItsaFalsy = ItsaFalsy;
itsa_1.Itsa.extend(ItsaFalsy, {
  id: 'falsy',
  validate: function validate(context) {
    var val = context.val,
        result = context.result;
    if (val) return result.registerError("Expected falsy value.");
  }
});

/***/ }),

/***/ 821:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaFunction = void 0;

var itsa_1 = __webpack_require__(589);

var helpers_1 = __webpack_require__(28);

var ItsaFunction = /*#__PURE__*/function () {
  function ItsaFunction() {
    _classCallCheck(this, ItsaFunction);
  }

  _createClass(ItsaFunction, [{
    key: "function",
    value: function _function() {
      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (settings.length) settings.length = helpers_1.primitiveToItsa(settings.length);
      this.predicates.push({
        id: 'function',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaFunction;
}();

exports.ItsaFunction = ItsaFunction;
itsa_1.Itsa.extend(ItsaFunction, {
  id: 'function',
  validate: function validate(context, settings) {
    var val = context.val,
        type = context.type,
        result = context.result;
    if (type !== 'function') return result.registerError('Expected function');

    if (settings.length) {
      var subResult = settings.length._validate({
        key: 'length',
        parent: null,
        val: val.length,
        exists: true,
        settings: context.validation,
        path: context.path
      });

      result.registerResult(subResult);
    }
  }
});

/***/ }),

/***/ 28:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.primitiveToItsa = void 0;

var itsa_1 = __webpack_require__(589);

function primitiveToItsa(val) {
  if (val instanceof itsa_1.Itsa) {
    return val;
  } else if (typeof val === 'function') {
    return itsa_1.itsa.constructorIs(val);
  } else {
    return itsa_1.itsa.equal(val);
  }
}

exports.primitiveToItsa = primitiveToItsa;

/***/ }),

/***/ 593:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaInstanceOf = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaInstanceOf = /*#__PURE__*/function () {
  function ItsaInstanceOf() {
    _classCallCheck(this, ItsaInstanceOf);
  }

  _createClass(ItsaInstanceOf, [{
    key: "instanceof",
    value: function _instanceof(cls) {
      var settings = {
        cls: cls
      };
      this.predicates.push({
        id: 'instanceof',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaInstanceOf;
}();

exports.ItsaInstanceOf = ItsaInstanceOf;
itsa_1.Itsa.extend(ItsaInstanceOf, {
  id: 'instanceof',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var isInstance = val instanceof settings.cls;

    if (!isInstance) {
      result.registerError("Expected instance of ".concat(settings.cls));
    }
  }
});

/***/ }),

/***/ 273:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaInteger = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaInteger = /*#__PURE__*/function () {
  function ItsaInteger() {
    _classCallCheck(this, ItsaInteger);
  }

  _createClass(ItsaInteger, [{
    key: "integer",
    value: function integer() {
      this.predicates.push({
        id: 'integer',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaInteger;
}();

exports.ItsaInteger = ItsaInteger;
itsa_1.Itsa.extend(ItsaInteger, {
  id: 'integer',
  validate: function validate(context) {
    var val = context.val,
        result = context.result;
    var valid = typeof val === "number" && isNaN(val) === false && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1 && val % 1 === 0;

    if (!valid) {
      result.registerError('Invalid integer');
    }
  }
});

/***/ }),

/***/ 589:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.itsa = exports.Itsa = exports.ItsaValidationResultBuilder = exports.ItsaValidationResult = exports.ItsaValidationException = void 0;

var ItsaValidationException = /*#__PURE__*/function (_Error) {
  _inherits(ItsaValidationException, _Error);

  var _super = _createSuper(ItsaValidationException);

  function ItsaValidationException(result) {
    var _this;

    _classCallCheck(this, ItsaValidationException);

    _this = _super.call(this);
    var path = result.errors[0].path.join('.');
    _this.message = "".concat(path ? "".concat(path, ": ") : '').concat(result.errors[0].message);
    _this.result = result;
    return _this;
  }

  return ItsaValidationException;
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.ItsaValidationException = ItsaValidationException;

var ItsaValidationResult = /*#__PURE__*/function () {
  function ItsaValidationResult() {
    _classCallCheck(this, ItsaValidationResult);

    this.errors = [];
  }

  _createClass(ItsaValidationResult, [{
    key: "okOrThrow",
    value: function okOrThrow() {
      if (!this.ok) throw new ItsaValidationException(this);
    }
  }, {
    key: "addError",
    value: function addError(error) {
      this.ok = false;
      this.message = error.message;
      this.errors.push(error);
    }
  }, {
    key: "addResult",
    value: function addResult(result) {
      var _this$errors$;

      if (!result.ok) this.ok = false;

      var _iterator = _createForOfIteratorHelper(result.errors),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var e = _step.value;
          this.errors.push(e);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.message = this.message || ((_this$errors$ = this.errors[0]) === null || _this$errors$ === void 0 ? void 0 : _this$errors$.message);
    }
  }]);

  return ItsaValidationResult;
}();

exports.ItsaValidationResult = ItsaValidationResult;

var ItsaValidationResultBuilder = /*#__PURE__*/function (_ItsaValidationResult) {
  _inherits(ItsaValidationResultBuilder, _ItsaValidationResult);

  var _super2 = _createSuper(ItsaValidationResultBuilder);

  function ItsaValidationResultBuilder(exhaustive, key, path) {
    var _this2;

    _classCallCheck(this, ItsaValidationResultBuilder);

    _this2 = _super2.call(this);
    _this2.ok = true;
    _this2.errors = [];
    _this2.value = undefined;
    _this2.message = undefined;
    _this2.key = key;
    _this2.exhaustive = exhaustive;
    _this2.path = path;
    return _this2;
  }

  _createClass(ItsaValidationResultBuilder, [{
    key: "registerError",
    value: function registerError(message) {
      var result = new ItsaValidationResult();
      result.addError({
        message: message,
        key: this.key,
        path: this.path
      });
      this.addResult(result);
    }
  }, {
    key: "registerResult",
    value: function registerResult(result) {
      this.addResult(result);

      if (!this.exhaustive && this.errors.length) {
        throw 'STOP_ON_FIRST_ERROR';
      }
    }
  }]);

  return ItsaValidationResultBuilder;
}(ItsaValidationResult);

exports.ItsaValidationResultBuilder = ItsaValidationResultBuilder;

var Itsa = /*#__PURE__*/function () {
  function Itsa() {
    _classCallCheck(this, Itsa);

    this.predicates = [];
  }

  _createClass(Itsa, null, [{
    key: "extend",
    value: function extend(cls) {
      for (var _len = arguments.length, validators = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        validators[_key - 1] = arguments[_key];
      }

      for (var _i = 0, _validators = validators; _i < _validators.length; _i++) {
        var validator = _validators[_i];
        Itsa.validators[validator.id] = validator;
      }

      var keys = Object.getOwnPropertyNames(cls.prototype).filter(function (m) {
        return m !== 'constructor';
      });

      var _iterator2 = _createForOfIteratorHelper(keys),
          _step2;

      try {
        var _loop = function _loop() {
          var key = _step2.value;
          var val = cls.prototype[key];
          Itsa.prototype[key] = val;
          /* istanbul ignore next */

          if (typeof val === 'function') {
            exports.itsa[key] = function () {
              var it = new Itsa();
              return it[key].apply(it, arguments);
            };
          }
        };

        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return Itsa;
}();

exports.Itsa = Itsa;
Itsa.validators = {};
exports.itsa = {
  predicates: []
};

__webpack_require__(970);

__webpack_require__(776);

__webpack_require__(911);

__webpack_require__(850);

__webpack_require__(233);

__webpack_require__(758);

__webpack_require__(438);

__webpack_require__(801);

__webpack_require__(228);

__webpack_require__(735);

__webpack_require__(609);

__webpack_require__(151);

__webpack_require__(947);

__webpack_require__(821);

__webpack_require__(593);

__webpack_require__(273);

__webpack_require__(206);

__webpack_require__(292);

__webpack_require__(365);

__webpack_require__(442);

__webpack_require__(42);

__webpack_require__(899);

__webpack_require__(752);

__webpack_require__(241);

__webpack_require__(76);

__webpack_require__(700);

__webpack_require__(744);

__webpack_require__(724);

__webpack_require__(409);

__webpack_require__(709);

__webpack_require__(886);

__webpack_require__(457);

__webpack_require__(997);

__webpack_require__(446);

/***/ }),

/***/ 206:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaLength = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaLength = /*#__PURE__*/function () {
  function ItsaLength() {
    _classCallCheck(this, ItsaLength);
  }

  _createClass(ItsaLength, [{
    key: "length",
    value: function length(min, max) {
      var settings = {
        min: min,
        max: max
      };

      if (typeof min === 'number' && typeof max !== 'number') {
        settings = {
          exactly: min
        };
      }

      if (typeof min !== 'number') {
        settings = {
          min: 1
        };
      }

      this.predicates.push({
        id: 'length',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaLength;
}();

exports.ItsaLength = ItsaLength;
itsa_1.Itsa.extend(ItsaLength, {
  id: 'length',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var len = val ? val.length : null;

    if (typeof len !== 'number') {
      return result.registerError('Invalid length');
    }

    if (typeof settings.exactly === 'number' && settings.exactly !== len) {
      return result.registerError("Expected length to be ".concat(settings.exactly));
    }

    if (typeof settings.min === 'number' && settings.min > len) {
      return result.registerError("Expected length to be at least ".concat(settings.min));
    }

    if (typeof settings.max === 'number' && settings.max < len) {
      return result.registerError("Expected length to be at most ".concat(settings.max));
    }
  }
});

/***/ }),

/***/ 292:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaMatches = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaMatches = /*#__PURE__*/function () {
  function ItsaMatches() {
    _classCallCheck(this, ItsaMatches);
  }

  _createClass(ItsaMatches, [{
    key: "matches",
    value: function matches(regex) {
      var settings = {
        regex: regex
      };
      this.predicates.push({
        id: 'matches',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaMatches;
}();

exports.ItsaMatches = ItsaMatches;
itsa_1.Itsa.extend(ItsaMatches, {
  id: 'matches',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var valid = settings.regex.test(String(val));

    if (!valid) {
      result.registerError("Does not match ".concat(settings.regex));
    }
  }
});

/***/ }),

/***/ 365:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaMax = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaMax = /*#__PURE__*/function () {
  function ItsaMax() {
    _classCallCheck(this, ItsaMax);
  }

  _createClass(ItsaMax, [{
    key: "max",
    value: function max(_max, inclusive) {
      var _inclusive;

      inclusive = (_inclusive = inclusive) !== null && _inclusive !== void 0 ? _inclusive : true;
      var settings = {
        max: _max,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'max',
        settings: settings
      });
      return this;
    }
  }, {
    key: "under",
    value: function under(max, inclusive) {
      var _inclusive2;

      inclusive = (_inclusive2 = inclusive) !== null && _inclusive2 !== void 0 ? _inclusive2 : false;
      var settings = {
        max: max,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'max',
        settings: settings
      });
      return this;
    }
  }, {
    key: "below",
    value: function below(max, inclusive) {
      var _inclusive3;

      inclusive = (_inclusive3 = inclusive) !== null && _inclusive3 !== void 0 ? _inclusive3 : false;
      var settings = {
        max: max,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'max',
        settings: settings
      });
      return this;
    }
  }, {
    key: "atMost",
    value: function atMost(max, inclusive) {
      var _inclusive4;

      inclusive = (_inclusive4 = inclusive) !== null && _inclusive4 !== void 0 ? _inclusive4 : true;
      var settings = {
        max: max,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'max',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaMax;
}();

exports.ItsaMax = ItsaMax;
itsa_1.Itsa.extend(ItsaMax, {
  id: 'max',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var max = settings.max,
        inclusive = settings.inclusive;

    if (inclusive) {
      var ok = val <= max;
      if (!ok) result.registerError("Value must be at most ".concat(max));
    } else {
      var _ok = val < max;

      if (!_ok) result.registerError("Value must be less than ".concat(max));
    }
  }
});

/***/ }),

/***/ 442:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaMin = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaMin = /*#__PURE__*/function () {
  function ItsaMin() {
    _classCallCheck(this, ItsaMin);
  }

  _createClass(ItsaMin, [{
    key: "min",
    value: function min(_min, inclusive) {
      var _inclusive;

      inclusive = (_inclusive = inclusive) !== null && _inclusive !== void 0 ? _inclusive : true;
      var settings = {
        min: _min,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'min',
        settings: settings
      });
      return this;
    }
  }, {
    key: "over",
    value: function over(min, inclusive) {
      var _inclusive2;

      inclusive = (_inclusive2 = inclusive) !== null && _inclusive2 !== void 0 ? _inclusive2 : false;
      var settings = {
        min: min,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'min',
        settings: settings
      });
      return this;
    }
  }, {
    key: "above",
    value: function above(min, inclusive) {
      var _inclusive3;

      inclusive = (_inclusive3 = inclusive) !== null && _inclusive3 !== void 0 ? _inclusive3 : false;
      var settings = {
        min: min,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'min',
        settings: settings
      });
      return this;
    }
  }, {
    key: "atLeast",
    value: function atLeast(min, inclusive) {
      var _inclusive4;

      inclusive = (_inclusive4 = inclusive) !== null && _inclusive4 !== void 0 ? _inclusive4 : true;
      var settings = {
        min: min,
        inclusive: inclusive
      };
      this.predicates.push({
        id: 'min',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaMin;
}();

exports.ItsaMin = ItsaMin;
itsa_1.Itsa.extend(ItsaMin, {
  id: 'min',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var min = settings.min,
        inclusive = settings.inclusive;

    if (inclusive) {
      var ok = val >= min;
      if (!ok) result.registerError("Value must be at least ".concat(min));
    } else {
      var _ok = val > min;

      if (!_ok) result.registerError("Value must be greater than ".concat(min));
    }
  }
});

/***/ }),

/***/ 42:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaNotEmpty = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaNotEmpty = /*#__PURE__*/function () {
  function ItsaNotEmpty() {
    _classCallCheck(this, ItsaNotEmpty);
  }

  _createClass(ItsaNotEmpty, [{
    key: "notEmpty",
    value: function notEmpty() {
      this.predicates.push({
        id: 'notEmpty',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaNotEmpty;
}();

exports.ItsaNotEmpty = ItsaNotEmpty;
itsa_1.Itsa.extend(ItsaNotEmpty, {
  id: 'notEmpty',
  validate: function validate(context) {
    var val = context.val,
        result = context.result;
    var len = val ? val.length : null;

    if (typeof len === 'number' && len) {
      return;
    }

    if (Object.prototype.toString.call(val) === "[object Object]") {
      var hasFields = false;

      for (var key in val) {
        if (!val.hasOwnProperty(key)) {
          continue;
        }

        hasFields = true;
        break;
      }

      if (!hasFields) {
        result.registerError("Object cannot be empty");
      }

      return;
    }

    result.registerError("Value cannot be empty");
  }
});

/***/ }),

/***/ 899:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaNull = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaNull = /*#__PURE__*/function () {
  function ItsaNull() {
    _classCallCheck(this, ItsaNull);
  }

  _createClass(ItsaNull, [{
    key: "null",
    value: function _null() {
      var settings = {
        example: null,
        strict: true
      };
      this.predicates.push({
        id: 'equal',
        settings: settings
      });
      return this;
    }
  }, {
    key: "undefined",
    value: function (_undefined) {
      function undefined() {
        return _undefined.apply(this, arguments);
      }

      undefined.toString = function () {
        return _undefined.toString();
      };

      return undefined;
    }(function () {
      var settings = {
        example: undefined,
        strict: true
      };
      this.predicates.push({
        id: 'equal',
        settings: settings
      });
      return this;
    })
  }]);

  return ItsaNull;
}();

exports.ItsaNull = ItsaNull;
itsa_1.Itsa.extend(ItsaNull);

/***/ }),

/***/ 752:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaNumber = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaNumber = /*#__PURE__*/function () {
  function ItsaNumber() {
    _classCallCheck(this, ItsaNumber);
  }

  _createClass(ItsaNumber, [{
    key: "number",
    value: function number() {
      this.predicates.push({
        id: 'number'
      });
      return this;
    }
  }]);

  return ItsaNumber;
}();

exports.ItsaNumber = ItsaNumber;
itsa_1.Itsa.extend(ItsaNumber, {
  id: 'number',
  validate: function validate(context) {
    var val = context.val,
        type = context.type,
        result = context.result;
    if (type !== 'number') return result.registerError("Expected number but type is ".concat(type, "."));
    if (isNaN(val)) return result.registerError("Expected number but found NaN.");
    if (!isFinite(val)) return result.registerError("Expected number but found infinity.");
  }
});

/***/ }),

/***/ 241:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaObject = void 0;

var itsa_1 = __webpack_require__(589);

var helpers_1 = __webpack_require__(28);

var ItsaObject = /*#__PURE__*/function () {
  function ItsaObject() {
    _classCallCheck(this, ItsaObject);
  }

  _createClass(ItsaObject, [{
    key: "object",
    value: function object(example) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var convertedExample = null;

      if (example) {
        convertedExample = {};

        for (var key in example) {
          convertedExample[key] = helpers_1.primitiveToItsa(example[key]);
        }
      }

      if (config.key) {
        config.key = helpers_1.primitiveToItsa(config.key);
      }

      if (config.value) {
        config.value = helpers_1.primitiveToItsa(config.value);
      }

      var settings = {
        example: convertedExample,
        config: config
      };
      this.predicates.push({
        id: 'object',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaObject;
}();

exports.ItsaObject = ItsaObject;
itsa_1.Itsa.extend(ItsaObject, {
  id: 'object',
  validate: function validate(context, settings) {
    var _config$extras;

    var val = context.val,
        parent = context.parent,
        validation = context.validation,
        result = context.result,
        type = context.type;
    var example = settings.example,
        config = settings.config;
    var extras = (_config$extras = config.extras) !== null && _config$extras !== void 0 ? _config$extras : false; // Validate object

    if (!val) return result.registerError("Expected object but value is ".concat(val, "."));
    if (type !== "object") return result.registerError("Expected object but type is ".concat(type, "."));
    if (val instanceof RegExp) return result.registerError("Expected object but type is regex.");
    if (val instanceof Date) return result.registerError("Expected object but type is date.");
    if (Array.isArray(val)) return result.registerError("Expected object but type is array.");
    var objectKeys = Object.keys(val);

    if (example) {
      // Validate according to example
      var exampleKeys = Object.keys(example);

      for (var _i = 0, _exampleKeys = exampleKeys; _i < _exampleKeys.length; _i++) {
        var key = _exampleKeys[_i];

        // For root object, we might skip missing fields
        if (!parent && validation.partial && !objectKeys.includes(key)) {
          continue;
        }

        var subSchema = example[key];

        var subResult = subSchema._validate({
          key: key,
          parent: val,
          val: val[key],
          exists: key in val,
          settings: validation,
          path: [].concat(_toConsumableArray(context.path), [key])
        });

        result.registerResult(subResult);
      } // Error for extra properties?


      if (!extras) {
        var extraKeys = objectKeys.filter(function (k) {
          return !exampleKeys.includes(k);
        });

        if (extraKeys.length) {
          result.registerError("Extra unknown properties: ".concat(extraKeys.join(', ')));
        }
      }
    }

    if (config.key) {
      var _iterator = _createForOfIteratorHelper(objectKeys),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _key = _step.value;

          var _subResult = config.key._validate({
            key: _key,
            parent: val,
            val: _key,
            exists: true,
            settings: validation,
            path: [].concat(_toConsumableArray(context.path), [_key])
          });

          result.registerResult(_subResult);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    if (config.value) {
      var _iterator2 = _createForOfIteratorHelper(objectKeys),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _key2 = _step2.value;
          var subVal = val[_key2];

          var _subResult2 = config.value._validate({
            key: _key2,
            parent: val,
            val: subVal,
            exists: true,
            settings: validation,
            path: [].concat(_toConsumableArray(context.path), [_key2])
          });

          result.registerResult(_subResult2);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }
});

/***/ }),

/***/ 76:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaObjectId = void 0;

var itsa_1 = __webpack_require__(589);

var rxObjectId = /^[0-9a-f]{24}$/i;

var ItsaObjectId = /*#__PURE__*/function () {
  function ItsaObjectId() {
    _classCallCheck(this, ItsaObjectId);
  }

  _createClass(ItsaObjectId, [{
    key: "objectid",
    value: function objectid() {
      this.predicates.push({
        id: 'objectid',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaObjectId;
}();

exports.ItsaObjectId = ItsaObjectId;
itsa_1.Itsa.extend(ItsaObjectId, {
  id: 'objectid',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result,
        type = context.type;
    if (!val) return result.registerError('ObjectId is required');
    if (type !== 'string') return result.registerError('ObjectId must be a string');
    if (val.length !== 24) return result.registerError('ObjectId must have 24 characters');
    if (!rxObjectId.test(val)) return result.registerError('ObjectId may only contain 0-9, a-z');
  }
});

/***/ }),

/***/ 700:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaSerialize = void 0;

var itsa_1 = __webpack_require__(589);

var convert = function convert(el) {
  var proto = Object.prototype.toString.call(el);
  var isObject = "[object Object]" === proto;
  var isArray = "[object Array]" === proto;

  if (!isObject && !isArray) {
    return el;
  } // replace sub-schemas: depth first


  for (var key in el) {
    el[key] = convert(el[key]);
  }

  if (isObject && el.predicates) {
    var i = new itsa_1.Itsa();
    i.predicates = el.predicates;
    return i;
  }

  return el;
};

var ItsaSerialize = /*#__PURE__*/function () {
  function ItsaSerialize() {
    _classCallCheck(this, ItsaSerialize);
  }

  _createClass(ItsaSerialize, [{
    key: "load",
    value: function load(raw) {
      this.predicates = convert(raw).predicates;
      return this;
    }
  }]);

  return ItsaSerialize;
}();

exports.ItsaSerialize = ItsaSerialize;
itsa_1.Itsa.extend(ItsaSerialize);

/***/ }),

/***/ 744:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaString = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaString = /*#__PURE__*/function () {
  function ItsaString() {
    _classCallCheck(this, ItsaString);
  }

  _createClass(ItsaString, [{
    key: "string",
    value: function string() {
      this.predicates.push({
        id: 'string',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaString;
}();

exports.ItsaString = ItsaString;
itsa_1.Itsa.extend(ItsaString, {
  id: 'string',
  validate: function validate(context) {
    var type = context.type,
        result = context.result;
    if (type !== 'string') return result.registerError("Expected string");
  }
});

/***/ }),

/***/ 724:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaTo = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaTo = /*#__PURE__*/function () {
  function ItsaTo() {
    _classCallCheck(this, ItsaTo);
  }

  _createClass(ItsaTo, [{
    key: "toDate",
    value: function toDate() {
      this.predicates.push({
        id: 'toDate',
        settings: null
      });
      return this;
    }
  }, {
    key: "toFloat",
    value: function toFloat() {
      this.predicates.push({
        id: 'toFloat',
        settings: null
      });
      return this;
    }
  }, {
    key: "toInt",
    value: function toInt(radix) {
      var settings = {
        radix: radix
      };
      this.predicates.push({
        id: 'toInt',
        settings: settings
      });
      return this;
    }
  }, {
    key: "toLowerCase",
    value: function toLowerCase() {
      this.predicates.push({
        id: 'toLowerCase'
      });
      return this;
    }
  }, {
    key: "toUpperCase",
    value: function toUpperCase() {
      this.predicates.push({
        id: 'toUpperCase'
      });
      return this;
    }
  }, {
    key: "toNow",
    value: function toNow() {
      this.predicates.push({
        id: 'toNow'
      });
      return this;
    }
  }, {
    key: "toString",
    value: function toString() {
      this.predicates.push({
        id: 'toString'
      });
      return this;
    }
  }, {
    key: "toTrimmed",
    value: function toTrimmed() {
      this.predicates.push({
        id: 'toTrimmed'
      });
      return this;
    }
  }]);

  return ItsaTo;
}();

exports.ItsaTo = ItsaTo;
itsa_1.Itsa.extend(ItsaTo, {
  id: 'toDate',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal,
        result = context.result;
    var date = new Date(val);
    if (!isFinite(date.getTime())) return result.registerError("Date conversion failed");
    setVal(date);
  }
}, {
  id: 'toFloat',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal,
        result = context.result;
    var newFloat = parseFloat(val);
    if (isNaN(newFloat)) return result.registerError("Float conversion failed");
    setVal(newFloat);
  }
}, {
  id: 'toInt',
  validate: function validate(context, settings) {
    var val = context.val,
        setVal = context.setVal,
        result = context.result;
    var radix = settings.radix;
    var newInt = parseInt(val, radix !== null && radix !== void 0 ? radix : 10);
    if (isNaN(newInt)) return result.registerError("Int conversion failed");
    setVal(newInt);
  }
}, {
  id: 'toLowerCase',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal;
    setVal(String(val).toLowerCase());
  }
}, {
  id: 'toUpperCase',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal;
    setVal(String(val).toUpperCase());
  }
}, {
  id: 'toNow',
  validate: function validate(context) {
    var setVal = context.setVal;
    setVal(new Date());
  }
}, {
  id: 'toString',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal;
    setVal(String(val));
  }
}, {
  id: 'toTrimmed',
  validate: function validate(context) {
    var val = context.val,
        setVal = context.setVal;
    setVal(String(val).trim());
  }
});

/***/ }),

/***/ 409:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var itsa_1 = __webpack_require__(589);

var ItsaTouch = /*#__PURE__*/function () {
  function ItsaTouch() {
    _classCallCheck(this, ItsaTouch);
  }

  _createClass(ItsaTouch, [{
    key: "touch",
    value: function touch(obj) {
      var objectPredicates = this.predicates.filter(function (p) {
        return p.id === 'object';
      });
      if (!objectPredicates.length) throw new Error("This is not an object schema.");
      if (!obj) throw new Error("The given obj cannot be falsy.");

      var _iterator = _createForOfIteratorHelper(objectPredicates),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var predicate = _step.value;
          var settings = predicate.settings;
          var example = settings.example;
          if (!example) throw new Error("A schema example is required.");
          var keys = Object.keys(example);

          for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
            var key = _keys[_i];

            if (!(key in obj)) {
              obj[key] = undefined;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);

  return ItsaTouch;
}();

itsa_1.Itsa.extend(ItsaTouch);

/***/ }),

/***/ 709:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaTruthy = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaTruthy = /*#__PURE__*/function () {
  function ItsaTruthy() {
    _classCallCheck(this, ItsaTruthy);
  }

  _createClass(ItsaTruthy, [{
    key: "truthy",
    value: function truthy() {
      this.predicates.push({
        id: 'truthy',
        settings: null
      });
      return this;
    }
  }]);

  return ItsaTruthy;
}();

exports.ItsaTruthy = ItsaTruthy;
itsa_1.Itsa.extend(ItsaTruthy, {
  id: 'truthy',
  validate: function validate(context) {
    var val = context.val,
        result = context.result;
    if (!val) return result.registerError("Expected truthy value.");
  }
});

/***/ }),

/***/ 886:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaTypeOf = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaTypeOf = /*#__PURE__*/function () {
  function ItsaTypeOf() {
    _classCallCheck(this, ItsaTypeOf);
  }

  _createClass(ItsaTypeOf, [{
    key: "typeof",
    value: function _typeof(type) {
      var settings = {
        type: type
      };
      this.predicates.push({
        id: 'typeof',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaTypeOf;
}();

exports.ItsaTypeOf = ItsaTypeOf;
itsa_1.Itsa.extend(ItsaTypeOf, {
  id: 'typeof',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var type = settings.type;

    var actualType = _typeof2(val);

    if (type !== actualType) {
      result.registerError("Expected ".concat(type));
    }
  }
});

/***/ }),

/***/ 457:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaUnique = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaUnique = /*#__PURE__*/function () {
  function ItsaUnique() {
    _classCallCheck(this, ItsaUnique);
  }

  _createClass(ItsaUnique, [{
    key: "unique",
    value: function unique(getter) {
      var settings = {
        getter: getter
      };
      this.predicates.push({
        id: 'unique',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaUnique;
}();

exports.ItsaUnique = ItsaUnique;
itsa_1.Itsa.extend(ItsaUnique, {
  id: 'unique',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var getter = settings.getter;
    var set = new Set();

    for (var key in val) {
      var subVal = val[key];
      if (getter) subVal = getter(subVal);

      if (set.has(subVal)) {
        return result.registerError("".concat(subVal, " occurred multiple times"));
      }

      set.add(subVal);
    }
  }
});

/***/ }),

/***/ 997:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var itsa_1 = __webpack_require__(589);

var ItsaValidation = /*#__PURE__*/function () {
  function ItsaValidation() {
    _classCallCheck(this, ItsaValidation);
  }

  _createClass(ItsaValidation, [{
    key: "_validate",
    value: function _validate(settings) {
      var key = settings.key;
      var result = new itsa_1.ItsaValidationResultBuilder(settings.settings.exhaustive, key, settings.path);
      result.value = settings.val;

      try {
        var setVal = function setVal(newVal) {
          if (settings.parent) {
            settings.parent[settings.key] = newVal;
            settings.val = newVal;
          } else {
            result.value = newVal;
          }
        };

        var _iterator = _createForOfIteratorHelper(this.predicates),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var predicate = _step.value;
            var validator = itsa_1.Itsa.validators[predicate.id];
            /* istanbul ignore next */

            if (!validator) throw new Error("Validator not found: ".concat(predicate.id));
            var context = {
              setVal: setVal,
              result: result,
              val: settings.val,
              key: settings.key,
              parent: settings.parent,
              exists: settings.exists,
              type: _typeof(settings.val),
              validation: settings.settings,
              path: settings.path
            };
            validator.validate(context, predicate.settings);
            if (!result.ok) return result;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } catch (e) {
        /* istanbul ignore next */
        if (e !== 'STOP_ON_FIRST_ERROR') throw e;
      }

      return result;
    }
  }, {
    key: "validate",
    value: function validate(val) {
      var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this._validate({
        val: val,
        settings: settings,
        key: null,
        parent: null,
        exists: true,
        path: []
      });
    }
  }, {
    key: "validOrThrow",
    value: function validOrThrow(val, settings) {
      this.validate(val, settings).okOrThrow();
    }
  }]);

  return ItsaValidation;
}();

itsa_1.Itsa.extend(ItsaValidation);

/***/ }),

/***/ 446:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.ItsaVerify = void 0;

var itsa_1 = __webpack_require__(589);

var ItsaVerify = /*#__PURE__*/function () {
  function ItsaVerify() {
    _classCallCheck(this, ItsaVerify);
  }

  _createClass(ItsaVerify, [{
    key: "verify",
    value: function verify(verifier) {
      var settings = {
        verifier: verifier
      };
      this.predicates.push({
        id: 'verify',
        settings: settings
      });
      return this;
    }
  }]);

  return ItsaVerify;
}();

exports.ItsaVerify = ItsaVerify;
itsa_1.Itsa.extend(ItsaVerify, {
  id: 'verify',
  validate: function validate(context, settings) {
    var val = context.val,
        result = context.result;
    var verifier = settings.verifier;

    try {
      var response = verifier(val);

      if (typeof response === 'boolean') {
        if (response === false) {
          result.registerError("Value is invalid");
        }

        return;
      }

      if (typeof response === 'string') {
        return result.registerError(response);
      }
    } catch (e) {
      if (e === 'STOP_ON_FIRST_ERROR') throw e;
      return result.registerError(e);
    }
  }
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(589);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=itsa.js.map