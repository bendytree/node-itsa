/*! 
  * @license 
  * itsa 1.2.19 <https://github.com/bendytree/node-itsa> 
  * Copyright 2/25/2015 Josh Wright <http://www.joshwright.com> 
  * MIT LICENSE <https://github.com/bendytree/node-itsa/blob/master/LICENSE> 
  */ 
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.itsa=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = require("./lib/itsa");

},{"./lib/itsa":4}],2:[function(require,module,exports){

/**
 * A list of built in aliases for itsa validators.
 *
 * { "aliasName" : "realName" }
 *
 */

module.exports = {
  "after": "over",
  "before": "under"
};

},{}],3:[function(require,module,exports){


module.exports = {

  isBoolean: function (val) {
    return Object.prototype.toString.call(val) === "[object Boolean]";
  },

  isValidDate: function (val) {
    return Object.prototype.toString.call(val) === "[object Date]" && isFinite(val);
  },

  isRegExp: function (val) {
    return Object.prototype.toString.call(val) === "[object RegExp]";
  },

  isFunction: function (val) {
    return Object.prototype.toString.call(val) === "[object Function]";
  },

  isArray: function (val) {
    return Object.prototype.toString.call(val) === "[object Array]";
  },

  isPlainObject: function (val) {
    return Object.prototype.toString.call(val) === "[object Object]";
  },

  isString: function (val) {
    return Object.prototype.toString.call(val) === "[object String]";
  },

  isValidNumber: function (val) {
    return typeof val === "number"
      && isNaN(val) === false
      && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1;
  },

  isArguments: function (val) {
    if (Object.prototype.toString.call(val) === "[object Arguments]") {
      return true;
    }
    //for Opera
    return typeof val === "object" && ( "callee" in val ) && typeof val.length === "number";
  },

  bind: function (fn, context) {
    return function(){
      return fn.apply(context, Array.prototype.slice.call(arguments));
    };
  }

};

},{}],4:[function(require,module,exports){

var helpers = require("./helpers");

var itsa = function () {
  //force `new`
  if (!(this instanceof itsa)) { return new itsa(); }

  this.validators = [];
  this.errorMessages = {};

  //pre-bind context for easy use
  this.validOrThrow = helpers.bind(require("./methods/validOrThrow"), this);
  this.validate = helpers.bind(require("./methods/validate"), this);
};

// Private
itsa.prototype._buildLog = require("./methods/build-log");
itsa.prototype._buildFinalResult = require("./methods/build-final-result");
itsa.prototype._combineResults = require("./methods/combine-results");
itsa.prototype._convertValidatorToItsaInstance = require("./methods/convert-validator-to-itsa-instance");
itsa.prototype._validate = require("./methods/_validate");
itsa.prototype._itsa = itsa;

// Public
itsa.prototype.msg = require("./methods/msg");
itsa.extend = require("./methods/extend");
itsa.alias = require("./methods/alias");

// Built in validators
itsa.extend(require("./validators"));

// Add aliases
var aliases = require("./aliases");
for (var key in aliases){
  itsa.alias(aliases[key], key)
}

module.exports = itsa;

},{"./aliases":2,"./helpers":3,"./methods/_validate":5,"./methods/alias":6,"./methods/build-final-result":7,"./methods/build-log":8,"./methods/combine-results":9,"./methods/convert-validator-to-itsa-instance":10,"./methods/extend":11,"./methods/msg":12,"./methods/validOrThrow":13,"./methods/validate":14,"./validators":36}],5:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function _validate(getter, setter) {
  var results = [];
  for (var i in this.validators) {
    if (!this.validators.hasOwnProperty(i)) continue;

    var validator = this.validators[i];

    //get result
    var result = runValidator(this, validator, getter, setter);

    //interpret result
    result = interpretResult(this, result);

    //custom error
    if (result.valid === false && this.errorMessages[validator]){
      result.logs[0].customMessage = this.errorMessages[validator];
    }

    //add it to list of results
    results.push(result);

    //invalid? short circuit
    if (result.valid === false) { break; }
  }
  return this._buildFinalResult(this._combineResults(results));
};

var runValidator = function (itsaInstance, validator, getter, setter) {
  try{
    //already an itsa instance? just run validate
    if (typeof validator === "object" && validator instanceof itsaInstance._itsa) {
      return validator.validate(getter, setter);
    }

    //time to get the real value (could be a value or a function)
    var val = typeof getter === "function" ? getter() : getter;

    //a function?
    if (typeof validator === "function"){
      //try a class type check
      var classTypeResult = runClassTypeValidator(validator, val);
      if (classTypeResult !== undefined){
        return classTypeResult;
      }

      //run the function with the value
      return validator.call(itsaInstance, val, setter);
    }

    //something else, so this is a === check
    return val === validator;
  }catch(e){
    //console.trace();
    //console.error(e);
    return "Unhandled error. "+String(e);
  }
};

var interpretResult = function (itsaInstance, result) {
  //result is a boolean?
  if (typeof result === "boolean") {
    return {
      valid: result,
      logs: [itsaInstance._buildLog("function", result?"Validation succeeded":"Validation failed", result)]
    };
  }

  //result is an object?
  if (helpers.isPlainObject(result)) {
    return result;
  }

  //otherwise interpret it as string=error
  var valid = typeof result !== "string" || !result;
  return {
    valid: valid,
    logs: [itsaInstance._buildLog("function", valid?"Validation succeeded":result, valid)]
  };
};

var runClassTypeValidator = function(cls, val) {
  var classMaps = [
    { cls: Boolean, validator: helpers.isBoolean },
    { cls: String, validator: helpers.isString },
    { cls: Number, validator: helpers.isValidNumber },
    { cls: Object, validator: helpers.isPlainObject },
    { cls: Date, validator: helpers.isValidDate },
    { cls: Array, validator: helpers.isArray },
    { cls: RegExp, validator: helpers.isRegExp },
    { cls: Function, validator: helpers.isFunction }
  ];
  for (var i in classMaps) {
    if (!classMaps.hasOwnProperty(i)) continue;

    var classMap = classMaps[i];
    if (cls === classMap.cls) {
      return classMap.validator(val);
    }
  }
  return undefined;
};

},{"../helpers":3}],6:[function(require,module,exports){



module.exports = function alias(oldName, newName) {
  this[newName] = this.prototype[newName] = function(){
    return this[oldName].apply(this, arguments);
  }
};

},{}],7:[function(require,module,exports){

var FinalResult = function (result) {
  this.valid = result.valid;
  this.logs = result.logs;
};

FinalResult.prototype.describe = function () {
  //valid? cool story bro
  if (this.valid) {
    return "Validation succeeded.";
  }

  //invalid
  var messages = [];
  for (var i in this.logs){
    if (!this.logs.hasOwnProperty(i)) { continue; }

    var log = this.logs[i];
    if (log.valid) continue;
    if (log.customMessage) {
      messages.push(log.customMessage);
    }else{
      messages.push((log.path ? (log.path + ": ") : "") + log.message);
    }
  }

  return messages.join("\n");
};

module.exports = function (result) {
  return new FinalResult(result);
};

},{}],8:[function(require,module,exports){


module.exports = function (validator, msg, valid) {
  var paths = [];
  var node = this;
  while (node && node._key) {
    paths.splice(0, 0, node._key);
    node = node._parent;
  }
  return {
    valid: valid,
    path: paths.join("."),
    validator: validator,
    message: msg,
  };
};

},{}],9:[function(require,module,exports){


module.exports = function (results) {
  //one result? shortcut
  if (results.length === 1) {
    return results[0];
  }

  var valid = true;
  var logs = [];

  for (var i in results) {
    if (!results.hasOwnProperty(i)) continue;

    var result = results[i];
    valid = valid && result.valid;

    if (result.logs && result.logs.length) {
      logs.push.apply(logs, result.logs);
    }
  }

  return { valid: valid, logs: logs };
};
},{}],10:[function(require,module,exports){

module.exports = function (validator) {
  //already an `itsa` instance?
  if (typeof validator === "object" && validator instanceof this._itsa) {
    return validator;
  }

  //not an instance yet, so create one
  var instance = new this._itsa();
  instance.validators.push(validator);
  return instance;
};

},{}],11:[function(require,module,exports){

module.exports = function extend(extensions) {
  for (var name in extensions) {
    //ignore inherited properties
    if (!extensions.hasOwnProperty(name)) { continue; }

    assign(this, name, extensions[name]);
  }
};

var assign = function (itsa, name, builder) {

  /**
   * Allows static access - like `itsa.string()`
   */
  itsa[name] = function () {
    var instance = new itsa();
    instance.validators = [builder.apply(instance, arguments)];
    return instance;
  };

  /**
   * Allows chaining - like `itsa.something().string()`
   */
  itsa.prototype[name] = function () {
    this.validators.push(builder.apply(this, arguments));
    return this;
  };

};

},{}],12:[function(require,module,exports){


module.exports = function msg(msg) {
  if (typeof msg !== "string" || !msg) {
    throw ".msg(...) must be given an error message";
  }

  this.errorMessages[this.validators[this.validators.length-1]] = msg;

  return this;
};

},{}],13:[function(require,module,exports){



module.exports = function validOrThrow(value) {
  var result = this.validate(value);
  if (result.valid === false) {
    throw result.describe();
  }
};

},{}],14:[function(require,module,exports){



module.exports = function validate(value) {
  return this._validate(function valueGetter(){
    return value;
  });
};

},{}],15:[function(require,module,exports){

var rx = /^[0-9a-z]*$/i;

module.exports = function alphanumericBuilder() {
  return function alphanumericChecker(val) {
    var type = typeof val;
    if (["string", "number"].indexOf(type) === -1) {
      return "Value should be alphanumeric, but isn't a string or number.";
    }
    return rx.test(val) ? null : "Value is not alphanumeric.";
  };
};


},{}],16:[function(require,module,exports){

module.exports = function anyBuilder() {
  //combine validators
  var validators = [].concat.apply([].slice.call(arguments));
  if (validators.length === 0) {
    throw "No validators given in itsa.any()";
  }

  //convert all validators to real itsa instances
  for(var i in validators) {
    if (!validators.hasOwnProperty(i)) continue;

    validators[i] = this._convertValidatorToItsaInstance(validators[i]);
  }

  return function anyChecker(val) {
    //find the first valid match
    var validResult = null;
    for(var i in validators) {
      if (!validators.hasOwnProperty(i)) continue;

      var itsaInstance = validators[i];

      //set same context on children
      itsaInstance._parent = this._parent;
      itsaInstance._key = this._key;

      //execute validator & stop if valid
      var result = itsaInstance.validate(val);
      if (result.valid) {
        validResult = result;
        break;
      }
    }

    //send back the result
    if (validResult) {
      return this._combineResults([
        {
          valid: true,
          logs: [this._buildLog("any", "Match found.", true)]
        },
        validResult
      ]);
    }else{
      return {
        valid: false,
        logs: [this._buildLog("any", "No matches found.", false)]
      };
    }
  };
};


},{}],17:[function(require,module,exports){

var helpers = require('../helpers');

module.exports = function argsBuilder(example, allowExtraItems) {
  //example is missing or an array
  var args = [].concat.apply([].slice.call(arguments));
  allowExtraItems = allowExtraItems || args.length === 0;
  if (args.length > 0) {
    var isExampleArray = helpers.isArray(example);
    if (!isExampleArray) {
      throw "in `.arguments(example)`, example must be omitted or an array";
    }
  }

  /*
  * The example is an array where each item is a validator.
  * Assign parent instance and key
  */
  for(var i in example) {
    if (!example.hasOwnProperty(i)) { continue; }

    var itsaInstance = this._convertValidatorToItsaInstance(example[i]);
    example[i] = itsaInstance;
    itsaInstance._parent = this;
    itsaInstance._key = String(i);
  }

  return function argsChecker(val){

    var results = [];

    // typeof [], null, etc are object, so use this check for actual objects
    var valid = helpers.isArguments(val);
    results.push({
      valid: valid,
      logs: [this._buildLog("arguments", "Type was :"+Object.prototype.toString.call(val), valid)]
    });
    if (valid === false) {
      return results[0];
    }

    //too many items in array?
    if (allowExtraItems === false && val.length > example.length) {
      return {
        valid: false,
        logs: [this._buildLog("array", "Example has "+example.length+" items, but arguments has "+val.length, false)]
      };
    }

    for(var i in example) {
      if (!example.hasOwnProperty(i)) { continue; }

      var itsaInstance = example[i];
      var getter = function () { return val[i]; };
      var setter = function (newVal) { val[i] = newVal; };
      var result = itsaInstance._validate.apply(itsaInstance, [getter, setter]);
      results.push(result);
    }

    return this._combineResults(results);
  };
};

},{"../helpers":3}],18:[function(require,module,exports){

var helpers = require('../helpers');

module.exports = function (example, allowExtraItems) {
  //example is missing or an array
  var args = [].concat.apply([].slice.call(arguments));
  allowExtraItems = allowExtraItems || args.length === 0;
  if (args.length > 0) {
    var isExampleArray = helpers.isArray(example);
    if (!isExampleArray) {
      throw "in `.array(example)`, example must be omitted or an array";
    }
  }

  /*
  * The example is an array where each item is a validator.
  * Assign parent instance and key
  */
  for(var i in example) {
    var itsaInstance = this._convertValidatorToItsaInstance(example[i]);
    example[i] = itsaInstance;
    itsaInstance._parent = this;
    itsaInstance._key = String(i);
  }

  return function(val){

    var results = [];

    // typeof [], null, etc are object, so use this check for actual objects
    var valid = helpers.isArray(val);
    results.push({
      valid: valid,
      logs: [this._buildLog("array", "Type was :"+Object.prototype.toString.call(val), valid)]
    });
    if (valid === false) {
      return results[0];
    }

    //too many items in array?
    if (allowExtraItems === false && val.length > example.length) {
      return {
        valid: false,
        logs: [this._buildLog("array", "Example has "+example.length+" items, but data has "+val.length, false)]
      };
    }

    for(var i in example) {
      var itsaInstance = example[i];
      var getter = function () { return val[i]; };
      var setter = function (newVal) { val[i] = newVal; };
      var result = itsaInstance._validate.apply(itsaInstance, [getter, setter]);
      results.push(result);
    }

    return this._combineResults(results);
  };
};

},{"../helpers":3}],19:[function(require,module,exports){

var helpers = require('../helpers');

module.exports = function (example) {
  var args = [].concat.apply([].slice.call(arguments));
  var doValidateItems = args.length > 0;

  return function(val){

    var results = [];

    // typeof [], null, etc are object, so use this check for actual objects
    var valid = helpers.isArray(val);
    results.push({
      valid: valid,
      logs: [this._buildLog("array", "Type was :"+Object.prototype.toString.call(val), valid)]
    });
    if (valid === false) {
      return results[0];
    }

    if (doValidateItems) {
      for(var i in val) {
        if (!val.hasOwnProperty(i)) continue;

        var itsaInstance = this._convertValidatorToItsaInstance(example);
        itsaInstance._parent = this;
        itsaInstance._key = String(i);
        var getter = function () { return val[i]; };
        var setter = function (newVal) { val[i] = newVal; };
        var result = itsaInstance._validate.apply(itsaInstance, [getter, setter]);
        results.push(result);
      }
    }

    return this._combineResults(results);
  };
};

},{"../helpers":3}],20:[function(require,module,exports){


module.exports = function betweenBuilder(min, max, inclusive) {
  return function betweenChecker(val) {
    if (inclusive) {
      return val >= min && val <= max ? null : "Value was not between minimum and maximum (inclusive).";
    }else{
      return val > min && val < max ? null : "Value was not between minimum and maximum (exclusive).";
    }
  };
};

},{}],21:[function(require,module,exports){


module.exports = function booleanBuilder() {
  return function booleanChecker(val) {
    var valid = typeof val === "boolean";
    return valid ? null : "Value is not a boolean.";
  };
};

},{}],22:[function(require,module,exports){


module.exports = function containsBuilder(value) {
  return function containsChecker(val) {
    var hasIndexOf = (val && val.indexOf) || (typeof val === "string");
    var valid = hasIndexOf && val.indexOf(value) > -1;
    return valid ? null : "Data does not contain the value.";
  };
};

},{}],23:[function(require,module,exports){


module.exports = function customBuilder(validatorFunction) {
  if (arguments.length === 0){
    throw "No validatorFunction given in itsa.custom(...)";
  }

  return validatorFunction.bind(this);
};

},{}],24:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function dateBuilder() {
  return function dateChecker(val) {
    var valid = helpers.isValidDate(val);
    return valid ? null : "Invalid date";
  };
};


},{"../helpers":3}],25:[function(require,module,exports){


module.exports = function defaultBuilder (defaultVal) {
  var args = [].concat.apply([].slice.call(arguments));
  if (args.length === 0){
    throw "No default value was given in `.default(...)`.";
  }

  return function defaultRunner (val, setter) {
    //make sure there is a parent object
    if (!setter) {
      throw "`.default(...)` may not be used unless it is within an object.";
    }

    var isFalsy = !val;
    if (isFalsy){
      setter(typeof defaultVal == "function" ? defaultVal() : defaultVal);
    }
  };
};
},{}],26:[function(require,module,exports){


module.exports = function defaultNowBuilder () {
  return function defaultNowRunner (val, setter) {
    if (!setter) {
      throw "`.defaultNow()` may not be used unless it is within an object or array.";
    }

    if (!val) {
      setter(new Date());
    }
  };
};
},{}],27:[function(require,module,exports){

var rx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function emailBuilder() {
  return function emailChecker(val) {
    return rx.test(val) ? null : "Not an email address.";
  };
};


},{}],28:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function emptyBuilder() {
  return function emptyChecker(val) {
    var classType = Object.prototype.toString.call(val);

    if (helpers.isString(val)) {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (helpers.isArray(val)) {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (helpers.isPlainObject(val)) {
      var numberOfFields = 0;
      for (var key in val) {
        if (!val.hasOwnProperty(key)) { continue; }
        numberOfFields += 1;
      }
      return numberOfFields === 0 ? null : "Expected empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be empty: "+Object.prototype.toString.call(val);
  };
};

},{"../helpers":3}],29:[function(require,module,exports){


module.exports = function endsWithBuilder(value) {
  return function endsWithChecker(val) {
    var hasIndexOf = (val && val.lastIndexOf) || (typeof val === "string");
    if (!hasIndexOf) {
      return "Data has no lastIndexOf, so there's no way to check `.endsWith()`.";
    }
    var index = val.lastIndexOf(value);
    if (index === -1){
      return "Data does not contain the value.";
    }

    var valueLength = (value && value.length) || 0;
    valueLength = typeof val === "string" ? valueLength : 1;
    //outside value is a string and inside value is an empty string? that's everywhere
    if (valueLength === 0) {
      return null;
    }
    var valid = index === (val.length - valueLength);
    return valid ? null : "Data contains the value, but does not end with it.";
  };
};

},{}],30:[function(require,module,exports){


module.exports = function equalBuilder(example) {
  if (arguments.length === 0){
    throw "No comparison object given in itsa.equal(...)";
  }

  return function equalChecker(val) {
    var valid = example === val;
    return valid ? null : "Value did not pass equality test.";
  };
};

},{}],31:[function(require,module,exports){


module.exports = function falseBuilder() {
  return function falseChecker(val) {
    return val === false ? null : "Value is not `false`.";
  };
};


},{}],32:[function(require,module,exports){


module.exports = function falsyBuilder() {
  return function falsyChecker(val) {
    return !val ? null : "Value is not falsy.";
  };
};


},{}],33:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function functionBuilder() {
  return function functionChecker(val) {
    var valid = helpers.isFunction(val);
    return valid ? null : "Value is not a function.";
  };
};

},{"../helpers":3}],34:[function(require,module,exports){

var rx = /^[0-9a-f]*$/i;

module.exports = function hexBuilder() {
  return function hexChecker(val) {
    var type = typeof val;
    if (["string", "number"].indexOf(type) === -1) {
      return "Value should be hex, but isn't a string or number.";
    }
    return rx.test(val) ? null : "Value is not hex.";
  };
};


},{}],35:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function ifBuilder(test, itsaInstance) {
  //validate
  if (!helpers.isPlainObject(test) && !helpers.isFunction(test))
    throw "Test argument should be a function or plain object.";
  if (!(itsaInstance instanceof this._itsa))
    throw "`if` requires an itsa instance as the second argument.";

  //convert obj to function?
  if (helpers.isPlainObject(test)) {
    var testObj = test;
    test = function (val) {
      if (!helpers.isPlainObject(val)) return false;

      for (var key in testObj) {
        if (!testObj.hasOwnProperty(key)) continue;

        if (val[key] !== testObj[key]) {
          return false;
        }
      }

      return true;
    }
  }

  return function ifChecker(val) {

    if (!test(val))
      return {
        valid: true,
        logs: [this._buildLog("if", "Condition failed in if expression.", true)]
      };

    var getter = function () { return val; };

    var result = itsaInstance._validate.apply(itsaInstance, [getter]);
    return result;
  };
};


},{"../helpers":3}],36:[function(require,module,exports){

module.exports = {
  "alphanumeric": require('./alphanumeric'),
  "any": require('./any'),
  "args": require('./args'),
  "array": require('./array'),
  "arrayOf": require('./arrayOf'),
  "between": require('./between'),
  "boolean": require('./boolean'),
  "custom": require('./custom'),
  "contains": require('./contains'),
  "date": require('./date'),
  "default": require('./default'),
  "defaultNow": require('./defaultNow'),
  "email": require('./email'),
  "empty": require('./empty'),
  "endsWith": require('./endsWith'),
  "equal": require('./equal'),
  "false": require('./false'),
  "falsy": require('./falsy'),
  "function": require('./function'),
  "hex": require('./hex'),
  "if": require('./if'),
  "integer": require('./integer'),
  "instanceof": require('./instanceof'),
  "json": require('./json'),
  "len": require('./len'),
  "lowercase": require('./lowercase'),
  "matches": require('./matches'),
  "maxLength": require('./maxLength'),
  "minLength": require('./minLength'),
  "nan": require('./nan'),
  "notEmpty": require('./notEmpty'),
  "null": require('./null'),
  "number": require('./number'),
  "object": require('./object'),
  "over": require('./over'),
  "regexp": require('./regexp'),
  "startsWith": require('./startsWith'),
  "string": require('./string'),
  "to": require('./to'),
  "toDate": require('./toDate'),
  "toFloat": require('./toFloat'),
  "toInteger": require('./toInteger'),
  "toLowercase": require('./toLowercase'),
  "toNow": require('./toNow'),
  "toString": require('./toString'),
  "toTrimmed": require('./toTrimmed'),
  "toUppercase": require('./toUppercase'),
  "true": require('./true'),
  "truthy": require('./truthy'),
  "typeof": require('./typeof'),
  "undefined": require('./undefined'),
  "under": require('./under'),
  "unique": require('./unique'),
  "uppercase": require('./uppercase')
};

},{"./alphanumeric":15,"./any":16,"./args":17,"./array":18,"./arrayOf":19,"./between":20,"./boolean":21,"./contains":22,"./custom":23,"./date":24,"./default":25,"./defaultNow":26,"./email":27,"./empty":28,"./endsWith":29,"./equal":30,"./false":31,"./falsy":32,"./function":33,"./hex":34,"./if":35,"./instanceof":37,"./integer":38,"./json":39,"./len":40,"./lowercase":41,"./matches":42,"./maxLength":43,"./minLength":44,"./nan":45,"./notEmpty":46,"./null":47,"./number":48,"./object":49,"./over":50,"./regexp":51,"./startsWith":52,"./string":53,"./to":54,"./toDate":55,"./toFloat":56,"./toInteger":57,"./toLowercase":58,"./toNow":59,"./toString":60,"./toTrimmed":61,"./toUppercase":62,"./true":63,"./truthy":64,"./typeof":65,"./undefined":66,"./under":67,"./unique":68,"./uppercase":69}],37:[function(require,module,exports){


module.exports = function instanceofBuilder(type) {
  if (typeof type != "function") {
    throw "Invalid type given to `itsa.instanceof(...)`: "+type;
  }
  return function instanceofChecker(val) {
    var valid = Object.getPrototypeOf(val) === type.prototype;
    return valid ? null : "instanceof check failed.";
  };
};

},{}],38:[function(require,module,exports){


module.exports = function integerBuilder() {
  return function integerChecker(val) {
    var valid = typeof val === "number"
        && isNaN(val) === false
        && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
        && val % 1 === 0;
    return valid ? null : "Invalid integer";
  };
};

},{}],39:[function(require,module,exports){

module.exports = function jsonBuilder() {
  return function jsonChecker(val) {
    if (typeof val !== "string") {
      return "JSON must be a string.";
    }

    try{
      JSON.parse(val);
      return null;
    }catch(e){
      return "Value is a not valid JSON string.";
    }
  };
};


},{}],40:[function(require,module,exports){


module.exports = function lenBuilder(exactOrMin, max) {
  var args = [].concat.apply([].slice.call(arguments));
  var validationType = "truthy";
  if (args.length === 1) validationType = "exact";
  if (args.length === 2) validationType = "between";

  return function lenChecker(val) {
    var length = (val || (typeof val) === "string") ? val.length : undefined;
    if (validationType === "truthy"){
      return length ? null : "Length is not truthy.";
    }else if (validationType === "exact"){
      return length === exactOrMin ? null : "Length is not exactly: "+exactOrMin;
    }else if (validationType === "between"){
      var valid = length >= exactOrMin && length <= max;
      return valid ? null : "Length is not between "+exactOrMin +" and " + max;
    }
  };
};

},{}],41:[function(require,module,exports){

var rx = /[A-Z]/;

module.exports = function lowercaseBuilder() {
  return function lowercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains uppercase characters.";
  };
};


},{}],42:[function(require,module,exports){


module.exports = function matchesBuilder(rx) {
  if (rx instanceof RegExp === false) {
    throw "`.matches(...)` requires a regexp";
  }

  return function matchesChecker(val) {
    var valid = rx.test(val);
    return valid ? null : "Value does not match regexp.";
  };
};

},{}],43:[function(require,module,exports){


module.exports = function (max) {
  if (typeof max != "number") {
    throw "Invalid maximum in maxLength: "+max;
  }
  return function (val) {
    var type = typeof val;
    var length = (val || type === "string") ? val.length : undefined;
    var valid = typeof length === "number" && length <= max;
    return {
      valid: valid,
      logs: [this._buildLog("maxLength", "Length is "+length+", max is "+max, valid)],
    };
  };
};

},{}],44:[function(require,module,exports){


module.exports = function minLengthBuilder(min) {
  if (typeof min != "number") {
    throw "Invalid minimum in minLength: "+min;
  }
  return function minLengthChecker(val) {
    var type = typeof val;
    var length = (val || type === "string") ? val.length : undefined;
    var valid = typeof length === "number" && length >= min;
    return valid ? null : ("Length is "+length+", minimum is "+min);
  };
};

},{}],45:[function(require,module,exports){


module.exports = function nanBuilder() {
  return function nanChecker(val) {
    return isNaN(val) ? null : "Value is not NaN.";
  };
};


},{}],46:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function notEmptyBuilder() {
  return function notEmptyChecker(val) {

    if (helpers.isString(val)) {
      return val.length !== 0 ? null : "Expected not empty, but length is: "+val.length;
    }

    if (helpers.isArray(val)) {
      return val.length !== 0 ? null : "Cannot be empty.";
    }

    if (helpers.isPlainObject(val)) {
      var numberOfFields = 0;
      for (var key in val) {
        if (!val.hasOwnProperty(key)) { continue; }

        numberOfFields += 1;
      }
      return numberOfFields !== 0 ? null : "Expected not empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be not-empty: "+Object.prototype.toString.call(val);
  };
};

},{"../helpers":3}],47:[function(require,module,exports){


module.exports = function nullBuilder() {
  return function nullChecker(val) {
    return val === null ? null : "Value is not null.";
  };
};


},{}],48:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function numberBuilder() {
  return function numberChecker(val) {
    var valid = helpers.isValidNumber(val);
    return valid ? null : "Invalid number";
  };
};


},{"../helpers":3}],49:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function (example, allowExtraFields) {
  var args = [].concat.apply([].slice.call(arguments));
  allowExtraFields = allowExtraFields || args.length === 0;

  /*
   * The example is an object where the keys are the field names
   * and the values are itsa instances.
   * Assign parent instance and key
   */
  for(var key in example) {
    if (!example.hasOwnProperty(key)) continue;
    var itsaInstance = this._convertValidatorToItsaInstance(example[key]);
    example[key] = itsaInstance;
    itsaInstance._parent = this;
    itsaInstance._key = key;
  }

  return function(val){

    var results = [];

    // typeof [], null, etc are object, so use this check for actual objects
    var valid = helpers.isPlainObject(val);
    results.push({
      valid: valid,
      logs: [this._buildLog("object", "Type was: "+Object.prototype.toString.call(val), valid)]
    });
    if (valid === false) {
      return results[0];
    }

    //extra fields not allowed?
    if (allowExtraFields === false) {
      var invalidFields = [];
      for(var key in val) {
        if (!val.hasOwnProperty(key)) continue;

        if (key in example === false) {
          invalidFields.push(key);
        }
      }
      if (invalidFields.length > 0) {
        return {
          valid: false,
          logs: [this._buildLog("object", "Unexpected fields: "+invalidFields.join(), false)]
        };
      }
    }

    for(var key in example) {
      if (!example.hasOwnProperty(key)) continue;

      var itsaInstance = example[key];
      var getter = function () { return val[key]; };
      var setter = function (newVal) { val[key] = newVal; };
      var result = itsaInstance._validate.apply(itsaInstance, [getter, setter]);
      results.push(result);
    }

    return this._combineResults(results);
  };
};

},{"../helpers":3}],50:[function(require,module,exports){


module.exports = function overBuilder(min, inclusive) {
  return function overChecker(val) {
    if (inclusive) {
      return val >= min ? null : "Value was not over the minimum (inclusive).";
    }else{
      return val > min ? null : "Value was not over the minimum (exclusive).";
    }
  };
};

},{}],51:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function () {
  return function (val) {
    var valid = helpers.isRegExp(val);
    return {
      valid: valid,
      logs: [this._buildLog("regexp", valid?"RegExp verified.":"Expected a RegExp.", valid)],
    };
  };
};

},{"../helpers":3}],52:[function(require,module,exports){


module.exports = function startsWithBuilder(value) {
  return function startsWithChecker(val) {
    var hasIndexOf = (val && val.indexOf) || (typeof val === "string");
    if (!hasIndexOf) {
      return "Data has no indexOf, so there's no way to check `.startsWith()`.";
    }
    var index = val.indexOf(value);
    if (index === -1){
      return "Data does not contain the value.";
    }
    return index === 0 ? null : "Data contains the value, but does not start with it.";
  };
};

},{}],53:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function () {
  return function (val) {
    var valid = helpers.isString(val);
    return {
      valid: valid,
      logs: [this._buildLog("string", valid?"String identified.":"Expected a string.", valid)]
    };
  };
};

},{"../helpers":3}],54:[function(require,module,exports){


module.exports = function toBuilder (valueOrGetter) {
  var args = [].concat.apply([].slice.call(arguments));
  if (args.length === 0){
    throw "No default value was given in `.to(...)`.";
  }

  return function toRunner (val, setter) {
    if (!setter) {
      throw "`.to(...)` may not be used unless it is within an object or array.";
    }

    setter(typeof valueOrGetter == "function" ? valueOrGetter() : valueOrGetter);
  };
};
},{}],55:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function toDateBuilder () {
  return function toDateRunner (val, setter) {
    if (!setter) throw "`.toDate()` may not be used unless it is within an object or array.";

    if (!val) {
      return "Unwilling to parse falsy values.";
    }

    if (helpers.isArray(val)) {
      return "Unwilling to create date from arrays.";
    }

    var date = new Date(val);
    if (isFinite(date)) {
      setter(date);
    }else{
      return "Unable to parse date.";
    }
  };
};

},{"../helpers":3}],56:[function(require,module,exports){

module.exports = function toFloatBuilder () {
  return function toFloatRunner (val, setter) {
    if (!setter) throw "`.toFloat()` may not be used unless it is within an object or array.";

    var newValue = parseFloat(val);
    if (val === newValue) {
      return null;
    }
    if (isNaN(newValue)) {
      return "Unable to convert data to float.";
    }else{
      setter(newValue);
      return null;
    }
  };
};

},{}],57:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function toIntegerBuilder (radix) {
  return function toIntegerRunner (val, setter) {
    if (!setter) throw "`.toInteger()` may not be used unless it is within an object or array.";

    var newValue;
    if (helpers.isValidDate(val)) {
      newValue = val.getTime();
    }else{
      newValue = parseInt(val, typeof radix === "undefined" ? 10 : radix);
    }
    if (val === newValue) {
      return null;
    }
    if (isNaN(newValue)) {
      return "Unable to convert data to integer.";
    }else{
      setter(newValue);
      return null;
    }
  };
};
},{"../helpers":3}],58:[function(require,module,exports){


module.exports = function toLowercaseBuilder () {
  return function toLowercaseRunner (val, setter) {
    if (!setter) throw "`.toLowercase()` may not be used unless it is within an object or array.";

    if (typeof val === "string") {
      var newValue = val.toLowerCase();
      if (val !== newValue) {
        setter(newValue);
      }
    }
  };
};
},{}],59:[function(require,module,exports){


module.exports = function toNowBuilder () {
  return function toNowRunner (val, setter) {
    if (!setter) {
      throw "`.toNow()` may not be used unless it is within an object or array.";
    }

    setter(new Date());
  };
};
},{}],60:[function(require,module,exports){


module.exports = function toStringBuilder () {
  return function toStringRunner (val, setter) {
    if (!setter) throw "`.toString()` may not be used unless it is within an object or array.";

    var newValue = String(val);
    if (val !== newValue) {
      setter(newValue);
    }
  };
};
},{}],61:[function(require,module,exports){


module.exports = function toTrimmedBuilder () {
  return function toTrimmedRunner (val, setter) {
    if (!setter) throw "`.toTrimmed()` may not be used unless it is within an object or array.";

    if (typeof val === "string") {
      var newValue = val.trim();
      if (val !== newValue) {
        setter(newValue);
      }
    }
  };
};
},{}],62:[function(require,module,exports){


module.exports = function toUppercaseBuilder () {
  return function toUppercaseRunner (val, setter) {
    if (!setter) throw "`.toUppercase()` may not be used unless it is within an object or array.";

    if (typeof val === "string") {
      var newValue = val.toUpperCase();
      if (val !== newValue) {
        setter(newValue);
      }
    }
  };
};
},{}],63:[function(require,module,exports){


module.exports = function trueBuilder() {
  return function trueChecker(val) {
    return val === true ? null : "Value is not `true`.";
  };
};


},{}],64:[function(require,module,exports){


module.exports = function truthyBuilder() {
  return function truthyChecker(val) {
    return val ? null : "Value is not truthy.";
  };
};


},{}],65:[function(require,module,exports){


module.exports = function typeofBuilder(type) {
  if (typeof type != "string") {
    throw "Invalid type given to `itsa.typeof(...)`: "+type;
  }
  return function typeofChecker(val) {
    var valid = typeof val === type;
    return valid ? null : ("Expected type "+type+", but type is "+(typeof val));
  };
};

},{}],66:[function(require,module,exports){


module.exports = function undefinedBuilder() {
  return function undefinedChecker(val) {
    return val === undefined ? null : "Value is not undefined.";
  };
};


},{}],67:[function(require,module,exports){


module.exports = function underBuilder(max, inclusive) {
  return function underChecker(val) {
    if (inclusive) {
      return val <= max ? null : "Value was not under the maximum (inclusive).";
    }else{
      return val < max ? null : "Value was not under the maximum (exclusive).";
    }
  };
};

},{}],68:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function uniqueBuilder(getter) {
  return function uniqueChecker(val) {
    var type = Object.prototype.toString.call(val);
    var isTypeValid = helpers.isArray(val) || helpers.isPlainObject(val) || helpers.isString(val);
    if (!isTypeValid) {
      return "Unable to check uniqueness on this type of data.";
    }

    var getterType = "";
    if (typeof getter === "function") { getterType = "function"; }
    else if (typeof getter !== "undefined") { getterType = "pluck"; }

    var items = [];
    for (var key in val) {
      if (!val.hasOwnProperty(key)) { continue; }

      var item = val[key];
      if (getterType === "function") {
        item = getter(item);
      }
      if (getterType === "pluck") {
        item = item[getter];
      }
      var alreadyFound = items.indexOf(item) > -1;
      if (alreadyFound) {
        return "Items are not unique.";
      }
      items.push(item);
    }
    return null;
  };
};


},{"../helpers":3}],69:[function(require,module,exports){

var rx = /[a-z]/;

module.exports = function uppercaseBuilder() {
  return function uppercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains lowercase characters.";
  };
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2hlbHBlcnMuanMiLCJsaWIvaXRzYS5qcyIsImxpYi9tZXRob2RzL192YWxpZGF0ZS5qcyIsImxpYi9tZXRob2RzL2FsaWFzLmpzIiwibGliL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0LmpzIiwibGliL21ldGhvZHMvYnVpbGQtbG9nLmpzIiwibGliL21ldGhvZHMvY29tYmluZS1yZXN1bHRzLmpzIiwibGliL21ldGhvZHMvY29udmVydC12YWxpZGF0b3ItdG8taXRzYS1pbnN0YW5jZS5qcyIsImxpYi9tZXRob2RzL2V4dGVuZC5qcyIsImxpYi9tZXRob2RzL21zZy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkT3JUaHJvdy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvYWxwaGFudW1lcmljLmpzIiwibGliL3ZhbGlkYXRvcnMvYW55LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJncy5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9mdW5jdGlvbi5qcyIsImxpYi92YWxpZGF0b3JzL2hleC5qcyIsImxpYi92YWxpZGF0b3JzL2lmLmpzIiwibGliL3ZhbGlkYXRvcnMvaW5kZXguanMiLCJsaWIvdmFsaWRhdG9ycy9pbnN0YW5jZW9mLmpzIiwibGliL3ZhbGlkYXRvcnMvaW50ZWdlci5qcyIsImxpYi92YWxpZGF0b3JzL2pzb24uanMiLCJsaWIvdmFsaWRhdG9ycy9sZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9sb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy9tYXRjaGVzLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF4TGVuZ3RoLmpzIiwibGliL3ZhbGlkYXRvcnMvbWluTGVuZ3RoLmpzIiwibGliL3ZhbGlkYXRvcnMvbmFuLmpzIiwibGliL3ZhbGlkYXRvcnMvbm90RW1wdHkuanMiLCJsaWIvdmFsaWRhdG9ycy9udWxsLmpzIiwibGliL3ZhbGlkYXRvcnMvbnVtYmVyLmpzIiwibGliL3ZhbGlkYXRvcnMvb2JqZWN0LmpzIiwibGliL3ZhbGlkYXRvcnMvb3Zlci5qcyIsImxpYi92YWxpZGF0b3JzL3JlZ2V4cC5qcyIsImxpYi92YWxpZGF0b3JzL3N0YXJ0c1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9zdHJpbmcuanMiLCJsaWIvdmFsaWRhdG9ycy90by5qcyIsImxpYi92YWxpZGF0b3JzL3RvRGF0ZS5qcyIsImxpYi92YWxpZGF0b3JzL3RvRmxvYXQuanMiLCJsaWIvdmFsaWRhdG9ycy90b0ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy90b0xvd2VyY2FzZS5qcyIsImxpYi92YWxpZGF0b3JzL3RvTm93LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9TdHJpbmcuanMiLCJsaWIvdmFsaWRhdG9ycy90b1RyaW1tZWQuanMiLCJsaWIvdmFsaWRhdG9ycy90b1VwcGVyY2FzZS5qcyIsImxpYi92YWxpZGF0b3JzL3RydWUuanMiLCJsaWIvdmFsaWRhdG9ycy90cnV0aHkuanMiLCJsaWIvdmFsaWRhdG9ycy90eXBlb2YuanMiLCJsaWIvdmFsaWRhdG9ycy91bmRlZmluZWQuanMiLCJsaWIvdmFsaWRhdG9ycy91bmRlci5qcyIsImxpYi92YWxpZGF0b3JzL3VuaXF1ZS5qcyIsImxpYi92YWxpZGF0b3JzL3VwcGVyY2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9pdHNhXCIpO1xuIiwiXG4vKipcbiAqIEEgbGlzdCBvZiBidWlsdCBpbiBhbGlhc2VzIGZvciBpdHNhIHZhbGlkYXRvcnMuXG4gKlxuICogeyBcImFsaWFzTmFtZVwiIDogXCJyZWFsTmFtZVwiIH1cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWZ0ZXJcIjogXCJvdmVyXCIsXG4gIFwiYmVmb3JlXCI6IFwidW5kZXJcIlxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpc0Jvb2xlYW46IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBCb29sZWFuXVwiO1xuICB9LFxuXG4gIGlzVmFsaWREYXRlOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgRGF0ZV1cIiAmJiBpc0Zpbml0ZSh2YWwpO1xuICB9LFxuXG4gIGlzUmVnRXhwOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgUmVnRXhwXVwiO1xuICB9LFxuXG4gIGlzRnVuY3Rpb246IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIjtcbiAgfSxcblxuICBpc0FycmF5OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gIH0sXG5cbiAgaXNQbGFpbk9iamVjdDogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfSxcblxuICBpc1N0cmluZzogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIjtcbiAgfSxcblxuICBpc1ZhbGlkTnVtYmVyOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCJcbiAgICAgICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlXG4gICAgICAmJiBbTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFldLmluZGV4T2YodmFsKSA9PT0gLTE7XG4gIH0sXG5cbiAgaXNBcmd1bWVudHM6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvL2ZvciBPcGVyYVxuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmICggXCJjYWxsZWVcIiBpbiB2YWwgKSAmJiB0eXBlb2YgdmFsLmxlbmd0aCA9PT0gXCJudW1iZXJcIjtcbiAgfSxcblxuICBiaW5kOiBmdW5jdGlvbiAoZm4sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9XG5cbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4vaGVscGVyc1wiKTtcblxudmFyIGl0c2EgPSBmdW5jdGlvbiAoKSB7XG4gIC8vZm9yY2UgYG5ld2BcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGl0c2EpKSB7IHJldHVybiBuZXcgaXRzYSgpOyB9XG5cbiAgdGhpcy52YWxpZGF0b3JzID0gW107XG4gIHRoaXMuZXJyb3JNZXNzYWdlcyA9IHt9O1xuXG4gIC8vcHJlLWJpbmQgY29udGV4dCBmb3IgZWFzeSB1c2VcbiAgdGhpcy52YWxpZE9yVGhyb3cgPSBoZWxwZXJzLmJpbmQocmVxdWlyZShcIi4vbWV0aG9kcy92YWxpZE9yVGhyb3dcIiksIHRoaXMpO1xuICB0aGlzLnZhbGlkYXRlID0gaGVscGVycy5iaW5kKHJlcXVpcmUoXCIuL21ldGhvZHMvdmFsaWRhdGVcIiksIHRoaXMpO1xufTtcblxuLy8gUHJpdmF0ZVxuaXRzYS5wcm90b3R5cGUuX2J1aWxkTG9nID0gcmVxdWlyZShcIi4vbWV0aG9kcy9idWlsZC1sb2dcIik7XG5pdHNhLnByb3RvdHlwZS5fYnVpbGRGaW5hbFJlc3VsdCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0XCIpO1xuaXRzYS5wcm90b3R5cGUuX2NvbWJpbmVSZXN1bHRzID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb21iaW5lLXJlc3VsdHNcIik7XG5pdHNhLnByb3RvdHlwZS5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb252ZXJ0LXZhbGlkYXRvci10by1pdHNhLWluc3RhbmNlXCIpO1xuaXRzYS5wcm90b3R5cGUuX3ZhbGlkYXRlID0gcmVxdWlyZShcIi4vbWV0aG9kcy9fdmFsaWRhdGVcIik7XG5pdHNhLnByb3RvdHlwZS5faXRzYSA9IGl0c2E7XG5cbi8vIFB1YmxpY1xuaXRzYS5wcm90b3R5cGUubXNnID0gcmVxdWlyZShcIi4vbWV0aG9kcy9tc2dcIik7XG5pdHNhLmV4dGVuZCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvZXh0ZW5kXCIpO1xuaXRzYS5hbGlhcyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYWxpYXNcIik7XG5cbi8vIEJ1aWx0IGluIHZhbGlkYXRvcnNcbml0c2EuZXh0ZW5kKHJlcXVpcmUoXCIuL3ZhbGlkYXRvcnNcIikpO1xuXG4vLyBBZGQgYWxpYXNlc1xudmFyIGFsaWFzZXMgPSByZXF1aXJlKFwiLi9hbGlhc2VzXCIpO1xuZm9yICh2YXIga2V5IGluIGFsaWFzZXMpe1xuICBpdHNhLmFsaWFzKGFsaWFzZXNba2V5XSwga2V5KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0c2E7XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX3ZhbGlkYXRlKGdldHRlciwgc2V0dGVyKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGZvciAodmFyIGkgaW4gdGhpcy52YWxpZGF0b3JzKSB7XG4gICAgaWYgKCF0aGlzLnZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgdmFyIHZhbGlkYXRvciA9IHRoaXMudmFsaWRhdG9yc1tpXTtcblxuICAgIC8vZ2V0IHJlc3VsdFxuICAgIHZhciByZXN1bHQgPSBydW5WYWxpZGF0b3IodGhpcywgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICAvL2ludGVycHJldCByZXN1bHRcbiAgICByZXN1bHQgPSBpbnRlcnByZXRSZXN1bHQodGhpcywgcmVzdWx0KTtcblxuICAgIC8vY3VzdG9tIGVycm9yXG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UgJiYgdGhpcy5lcnJvck1lc3NhZ2VzW3ZhbGlkYXRvcl0pe1xuICAgICAgcmVzdWx0LmxvZ3NbMF0uY3VzdG9tTWVzc2FnZSA9IHRoaXMuZXJyb3JNZXNzYWdlc1t2YWxpZGF0b3JdO1xuICAgIH1cblxuICAgIC8vYWRkIGl0IHRvIGxpc3Qgb2YgcmVzdWx0c1xuICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuXG4gICAgLy9pbnZhbGlkPyBzaG9ydCBjaXJjdWl0XG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UpIHsgYnJlYWs7IH1cbiAgfVxuICByZXR1cm4gdGhpcy5fYnVpbGRGaW5hbFJlc3VsdCh0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKSk7XG59O1xuXG52YXIgcnVuVmFsaWRhdG9yID0gZnVuY3Rpb24gKGl0c2FJbnN0YW5jZSwgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcikge1xuICB0cnl7XG4gICAgLy9hbHJlYWR5IGFuIGl0c2EgaW5zdGFuY2U/IGp1c3QgcnVuIHZhbGlkYXRlXG4gICAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwib2JqZWN0XCIgJiYgdmFsaWRhdG9yIGluc3RhbmNlb2YgaXRzYUluc3RhbmNlLl9pdHNhKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdG9yLnZhbGlkYXRlKGdldHRlciwgc2V0dGVyKTtcbiAgICB9XG5cbiAgICAvL3RpbWUgdG8gZ2V0IHRoZSByZWFsIHZhbHVlIChjb3VsZCBiZSBhIHZhbHVlIG9yIGEgZnVuY3Rpb24pXG4gICAgdmFyIHZhbCA9IHR5cGVvZiBnZXR0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IGdldHRlcigpIDogZ2V0dGVyO1xuXG4gICAgLy9hIGZ1bmN0aW9uP1xuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgLy90cnkgYSBjbGFzcyB0eXBlIGNoZWNrXG4gICAgICB2YXIgY2xhc3NUeXBlUmVzdWx0ID0gcnVuQ2xhc3NUeXBlVmFsaWRhdG9yKHZhbGlkYXRvciwgdmFsKTtcbiAgICAgIGlmIChjbGFzc1R5cGVSZXN1bHQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBjbGFzc1R5cGVSZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIC8vcnVuIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSB2YWx1ZVxuICAgICAgcmV0dXJuIHZhbGlkYXRvci5jYWxsKGl0c2FJbnN0YW5jZSwgdmFsLCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIC8vc29tZXRoaW5nIGVsc2UsIHNvIHRoaXMgaXMgYSA9PT0gY2hlY2tcbiAgICByZXR1cm4gdmFsID09PSB2YWxpZGF0b3I7XG4gIH1jYXRjaChlKXtcbiAgICAvL2NvbnNvbGUudHJhY2UoKTtcbiAgICAvL2NvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIFwiVW5oYW5kbGVkIGVycm9yLiBcIitTdHJpbmcoZSk7XG4gIH1cbn07XG5cbnZhciBpbnRlcnByZXRSZXN1bHQgPSBmdW5jdGlvbiAoaXRzYUluc3RhbmNlLCByZXN1bHQpIHtcbiAgLy9yZXN1bHQgaXMgYSBib29sZWFuP1xuICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gXCJib29sZWFuXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHJlc3VsdCxcbiAgICAgIGxvZ3M6IFtpdHNhSW5zdGFuY2UuX2J1aWxkTG9nKFwiZnVuY3Rpb25cIiwgcmVzdWx0P1wiVmFsaWRhdGlvbiBzdWNjZWVkZWRcIjpcIlZhbGlkYXRpb24gZmFpbGVkXCIsIHJlc3VsdCldXG4gICAgfTtcbiAgfVxuXG4gIC8vcmVzdWx0IGlzIGFuIG9iamVjdD9cbiAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdChyZXN1bHQpKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vb3RoZXJ3aXNlIGludGVycHJldCBpdCBhcyBzdHJpbmc9ZXJyb3JcbiAgdmFyIHZhbGlkID0gdHlwZW9mIHJlc3VsdCAhPT0gXCJzdHJpbmdcIiB8fCAhcmVzdWx0O1xuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWxpZCxcbiAgICBsb2dzOiBbaXRzYUluc3RhbmNlLl9idWlsZExvZyhcImZ1bmN0aW9uXCIsIHZhbGlkP1wiVmFsaWRhdGlvbiBzdWNjZWVkZWRcIjpyZXN1bHQsIHZhbGlkKV1cbiAgfTtcbn07XG5cbnZhciBydW5DbGFzc1R5cGVWYWxpZGF0b3IgPSBmdW5jdGlvbihjbHMsIHZhbCkge1xuICB2YXIgY2xhc3NNYXBzID0gW1xuICAgIHsgY2xzOiBCb29sZWFuLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNCb29sZWFuIH0sXG4gICAgeyBjbHM6IFN0cmluZywgdmFsaWRhdG9yOiBoZWxwZXJzLmlzU3RyaW5nIH0sXG4gICAgeyBjbHM6IE51bWJlciwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzVmFsaWROdW1iZXIgfSxcbiAgICB7IGNsczogT2JqZWN0LCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNQbGFpbk9iamVjdCB9LFxuICAgIHsgY2xzOiBEYXRlLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNWYWxpZERhdGUgfSxcbiAgICB7IGNsczogQXJyYXksIHZhbGlkYXRvcjogaGVscGVycy5pc0FycmF5IH0sXG4gICAgeyBjbHM6IFJlZ0V4cCwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzUmVnRXhwIH0sXG4gICAgeyBjbHM6IEZ1bmN0aW9uLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNGdW5jdGlvbiB9XG4gIF07XG4gIGZvciAodmFyIGkgaW4gY2xhc3NNYXBzKSB7XG4gICAgaWYgKCFjbGFzc01hcHMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgdmFyIGNsYXNzTWFwID0gY2xhc3NNYXBzW2ldO1xuICAgIGlmIChjbHMgPT09IGNsYXNzTWFwLmNscykge1xuICAgICAgcmV0dXJuIGNsYXNzTWFwLnZhbGlkYXRvcih2YWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYWxpYXMob2xkTmFtZSwgbmV3TmFtZSkge1xuICB0aGlzW25ld05hbWVdID0gdGhpcy5wcm90b3R5cGVbbmV3TmFtZV0gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzW29sZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn07XG4iLCJcbnZhciBGaW5hbFJlc3VsdCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgdGhpcy52YWxpZCA9IHJlc3VsdC52YWxpZDtcbiAgdGhpcy5sb2dzID0gcmVzdWx0LmxvZ3M7XG59O1xuXG5GaW5hbFJlc3VsdC5wcm90b3R5cGUuZGVzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vdmFsaWQ/IGNvb2wgc3RvcnkgYnJvXG4gIGlmICh0aGlzLnZhbGlkKSB7XG4gICAgcmV0dXJuIFwiVmFsaWRhdGlvbiBzdWNjZWVkZWQuXCI7XG4gIH1cblxuICAvL2ludmFsaWRcbiAgdmFyIG1lc3NhZ2VzID0gW107XG4gIGZvciAodmFyIGkgaW4gdGhpcy5sb2dzKXtcbiAgICBpZiAoIXRoaXMubG9ncy5oYXNPd25Qcm9wZXJ0eShpKSkgeyBjb250aW51ZTsgfVxuXG4gICAgdmFyIGxvZyA9IHRoaXMubG9nc1tpXTtcbiAgICBpZiAobG9nLnZhbGlkKSBjb250aW51ZTtcbiAgICBpZiAobG9nLmN1c3RvbU1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2gobG9nLmN1c3RvbU1lc3NhZ2UpO1xuICAgIH1lbHNle1xuICAgICAgbWVzc2FnZXMucHVzaCgobG9nLnBhdGggPyAobG9nLnBhdGggKyBcIjogXCIpIDogXCJcIikgKyBsb2cubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2VzLmpvaW4oXCJcXG5cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgcmV0dXJuIG5ldyBGaW5hbFJlc3VsdChyZXN1bHQpO1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWxpZGF0b3IsIG1zZywgdmFsaWQpIHtcbiAgdmFyIHBhdGhzID0gW107XG4gIHZhciBub2RlID0gdGhpcztcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZS5fa2V5KSB7XG4gICAgcGF0aHMuc3BsaWNlKDAsIDAsIG5vZGUuX2tleSk7XG4gICAgbm9kZSA9IG5vZGUuX3BhcmVudDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWxpZCxcbiAgICBwYXRoOiBwYXRocy5qb2luKFwiLlwiKSxcbiAgICB2YWxpZGF0b3I6IHZhbGlkYXRvcixcbiAgICBtZXNzYWdlOiBtc2csXG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgLy9vbmUgcmVzdWx0PyBzaG9ydGN1dFxuICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgfVxuXG4gIHZhciB2YWxpZCA9IHRydWU7XG4gIHZhciBsb2dzID0gW107XG5cbiAgZm9yICh2YXIgaSBpbiByZXN1bHRzKSB7XG4gICAgaWYgKCFyZXN1bHRzLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcblxuICAgIHZhciByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgIHZhbGlkID0gdmFsaWQgJiYgcmVzdWx0LnZhbGlkO1xuXG4gICAgaWYgKHJlc3VsdC5sb2dzICYmIHJlc3VsdC5sb2dzLmxlbmd0aCkge1xuICAgICAgbG9ncy5wdXNoLmFwcGx5KGxvZ3MsIHJlc3VsdC5sb2dzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdmFsaWQsIGxvZ3M6IGxvZ3MgfTtcbn07IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWxpZGF0b3IpIHtcbiAgLy9hbHJlYWR5IGFuIGBpdHNhYCBpbnN0YW5jZT9cbiAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwib2JqZWN0XCIgJiYgdmFsaWRhdG9yIGluc3RhbmNlb2YgdGhpcy5faXRzYSkge1xuICAgIHJldHVybiB2YWxpZGF0b3I7XG4gIH1cblxuICAvL25vdCBhbiBpbnN0YW5jZSB5ZXQsIHNvIGNyZWF0ZSBvbmVcbiAgdmFyIGluc3RhbmNlID0gbmV3IHRoaXMuX2l0c2EoKTtcbiAgaW5zdGFuY2UudmFsaWRhdG9ycy5wdXNoKHZhbGlkYXRvcik7XG4gIHJldHVybiBpbnN0YW5jZTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKGV4dGVuc2lvbnMpIHtcbiAgZm9yICh2YXIgbmFtZSBpbiBleHRlbnNpb25zKSB7XG4gICAgLy9pZ25vcmUgaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAgICBpZiAoIWV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHsgY29udGludWU7IH1cblxuICAgIGFzc2lnbih0aGlzLCBuYW1lLCBleHRlbnNpb25zW25hbWVdKTtcbiAgfVxufTtcblxudmFyIGFzc2lnbiA9IGZ1bmN0aW9uIChpdHNhLCBuYW1lLCBidWlsZGVyKSB7XG5cbiAgLyoqXG4gICAqIEFsbG93cyBzdGF0aWMgYWNjZXNzIC0gbGlrZSBgaXRzYS5zdHJpbmcoKWBcbiAgICovXG4gIGl0c2FbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IGl0c2EoKTtcbiAgICBpbnN0YW5jZS52YWxpZGF0b3JzID0gW2J1aWxkZXIuYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyldO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvKipcbiAgICogQWxsb3dzIGNoYWluaW5nIC0gbGlrZSBgaXRzYS5zb21ldGhpbmcoKS5zdHJpbmcoKWBcbiAgICovXG4gIGl0c2EucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsaWRhdG9ycy5wdXNoKGJ1aWxkZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtc2cobXNnKSB7XG4gIGlmICh0eXBlb2YgbXNnICE9PSBcInN0cmluZ1wiIHx8ICFtc2cpIHtcbiAgICB0aHJvdyBcIi5tc2coLi4uKSBtdXN0IGJlIGdpdmVuIGFuIGVycm9yIG1lc3NhZ2VcIjtcbiAgfVxuXG4gIHRoaXMuZXJyb3JNZXNzYWdlc1t0aGlzLnZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3JzLmxlbmd0aC0xXV0gPSBtc2c7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB2YWxpZE9yVGhyb3codmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMudmFsaWRhdGUodmFsdWUpO1xuICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSkge1xuICAgIHRocm93IHJlc3VsdC5kZXNjcmliZSgpO1xuICB9XG59O1xuIiwiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB2YWxpZGF0ZSh2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5fdmFsaWRhdGUoZnVuY3Rpb24gdmFsdWVHZXR0ZXIoKXtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0pO1xufTtcbiIsIlxudmFyIHJ4ID0gL15bMC05YS16XSokL2k7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYWxwaGFudW1lcmljQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGFscGhhbnVtZXJpY0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmIChbXCJzdHJpbmdcIiwgXCJudW1iZXJcIl0uaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIlZhbHVlIHNob3VsZCBiZSBhbHBoYW51bWVyaWMsIGJ1dCBpc24ndCBhIHN0cmluZyBvciBudW1iZXIuXCI7XG4gICAgfVxuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYWxwaGFudW1lcmljLlwiO1xuICB9O1xufTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFueUJ1aWxkZXIoKSB7XG4gIC8vY29tYmluZSB2YWxpZGF0b3JzXG4gIHZhciB2YWxpZGF0b3JzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmICh2YWxpZGF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IFwiTm8gdmFsaWRhdG9ycyBnaXZlbiBpbiBpdHNhLmFueSgpXCI7XG4gIH1cblxuICAvL2NvbnZlcnQgYWxsIHZhbGlkYXRvcnMgdG8gcmVhbCBpdHNhIGluc3RhbmNlc1xuICBmb3IodmFyIGkgaW4gdmFsaWRhdG9ycykge1xuICAgIGlmICghdmFsaWRhdG9ycy5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICB2YWxpZGF0b3JzW2ldID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKHZhbGlkYXRvcnNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGFueUNoZWNrZXIodmFsKSB7XG4gICAgLy9maW5kIHRoZSBmaXJzdCB2YWxpZCBtYXRjaFxuICAgIHZhciB2YWxpZFJlc3VsdCA9IG51bGw7XG4gICAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICAgIGlmICghdmFsaWRhdG9ycy5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSB2YWxpZGF0b3JzW2ldO1xuXG4gICAgICAvL3NldCBzYW1lIGNvbnRleHQgb24gY2hpbGRyZW5cbiAgICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuICAgICAgaXRzYUluc3RhbmNlLl9rZXkgPSB0aGlzLl9rZXk7XG5cbiAgICAgIC8vZXhlY3V0ZSB2YWxpZGF0b3IgJiBzdG9wIGlmIHZhbGlkXG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLnZhbGlkYXRlKHZhbCk7XG4gICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgIHZhbGlkUmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3NlbmQgYmFjayB0aGUgcmVzdWx0XG4gICAgaWYgKHZhbGlkUmVzdWx0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMoW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYW55XCIsIFwiTWF0Y2ggZm91bmQuXCIsIHRydWUpXVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZFJlc3VsdFxuICAgICAgXSk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFueVwiLCBcIk5vIG1hdGNoZXMgZm91bmQuXCIsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcmdzQnVpbGRlcihleGFtcGxlLCBhbGxvd0V4dHJhSXRlbXMpIHtcbiAgLy9leGFtcGxlIGlzIG1pc3Npbmcgb3IgYW4gYXJyYXlcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUl0ZW1zID0gYWxsb3dFeHRyYUl0ZW1zIHx8IGFyZ3MubGVuZ3RoID09PSAwO1xuICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGlzRXhhbXBsZUFycmF5ID0gaGVscGVycy5pc0FycmF5KGV4YW1wbGUpO1xuICAgIGlmICghaXNFeGFtcGxlQXJyYXkpIHtcbiAgICAgIHRocm93IFwiaW4gYC5hcmd1bWVudHMoZXhhbXBsZSlgLCBleGFtcGxlIG11c3QgYmUgb21pdHRlZCBvciBhbiBhcnJheVwiO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogVGhlIGV4YW1wbGUgaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBpdGVtIGlzIGEgdmFsaWRhdG9yLlxuICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAqL1xuICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShpKSkgeyBjb250aW51ZTsgfVxuXG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2ldKTtcbiAgICBleGFtcGxlW2ldID0gaXRzYUluc3RhbmNlO1xuICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBhcmdzQ2hlY2tlcih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNBcmd1bWVudHModmFsKTtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJndW1lbnRzXCIsIFwiVHlwZSB3YXMgOlwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy90b28gbWFueSBpdGVtcyBpbiBhcnJheT9cbiAgICBpZiAoYWxsb3dFeHRyYUl0ZW1zID09PSBmYWxzZSAmJiB2YWwubGVuZ3RoID4gZXhhbXBsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJFeGFtcGxlIGhhcyBcIitleGFtcGxlLmxlbmd0aCtcIiBpdGVtcywgYnV0IGFyZ3VtZW50cyBoYXMgXCIrdmFsLmxlbmd0aCwgZmFsc2UpXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgICAgaWYgKCFleGFtcGxlLmhhc093blByb3BlcnR5KGkpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2ldO1xuICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtpXSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSwgYWxsb3dFeHRyYUl0ZW1zKSB7XG4gIC8vZXhhbXBsZSBpcyBtaXNzaW5nIG9yIGFuIGFycmF5XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGFsbG93RXh0cmFJdGVtcyA9IGFsbG93RXh0cmFJdGVtcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcbiAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBpc0V4YW1wbGVBcnJheSA9IGhlbHBlcnMuaXNBcnJheShleGFtcGxlKTtcbiAgICBpZiAoIWlzRXhhbXBsZUFycmF5KSB7XG4gICAgICB0aHJvdyBcImluIGAuYXJyYXkoZXhhbXBsZSlgLCBleGFtcGxlIG11c3QgYmUgb21pdHRlZCBvciBhbiBhcnJheVwiO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogVGhlIGV4YW1wbGUgaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBpdGVtIGlzIGEgdmFsaWRhdG9yLlxuICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAqL1xuICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZVtpXSk7XG4gICAgZXhhbXBsZVtpXSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBTdHJpbmcoaSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzQXJyYXkodmFsKTtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJUeXBlIHdhcyA6XCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCksIHZhbGlkKV1cbiAgICB9KTtcbiAgICBpZiAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICB9XG5cbiAgICAvL3RvbyBtYW55IGl0ZW1zIGluIGFycmF5P1xuICAgIGlmIChhbGxvd0V4dHJhSXRlbXMgPT09IGZhbHNlICYmIHZhbC5sZW5ndGggPiBleGFtcGxlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcnJheVwiLCBcIkV4YW1wbGUgaGFzIFwiK2V4YW1wbGUubGVuZ3RoK1wiIGl0ZW1zLCBidXQgZGF0YSBoYXMgXCIrdmFsLmxlbmd0aCwgZmFsc2UpXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IGV4YW1wbGVbaV07XG4gICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2ldOyB9O1xuICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2ldID0gbmV3VmFsOyB9O1xuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS5fdmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGFtcGxlKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIHZhciBkb1ZhbGlkYXRlSXRlbXMgPSBhcmdzLmxlbmd0aCA+IDA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgLy8gdHlwZW9mIFtdLCBudWxsLCBldGMgYXJlIG9iamVjdCwgc28gdXNlIHRoaXMgY2hlY2sgZm9yIGFjdHVhbCBvYmplY3RzXG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc0FycmF5KHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiVHlwZSB3YXMgOlwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgaWYgKGRvVmFsaWRhdGVJdGVtcykge1xuICAgICAgZm9yKHZhciBpIGluIHZhbCkge1xuICAgICAgICBpZiAoIXZhbC5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlKTtcbiAgICAgICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgICAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2ldID0gbmV3VmFsOyB9O1xuICAgICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmV0d2VlbkJ1aWxkZXIobWluLCBtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gYmV0d2VlbkNoZWNrZXIodmFsKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcmV0dXJuIHZhbCA+PSBtaW4gJiYgdmFsIDw9IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgYmV0d2VlbiBtaW5pbXVtIGFuZCBtYXhpbXVtIChpbmNsdXNpdmUpLlwiO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHZhbCA+IG1pbiAmJiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IGJldHdlZW4gbWluaW11bSBhbmQgbWF4aW11bSAoZXhjbHVzaXZlKS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYm9vbGVhbkJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBib29sZWFuQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcImJvb2xlYW5cIjtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYSBib29sZWFuLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbnRhaW5zQnVpbGRlcih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gY29udGFpbnNDaGVja2VyKHZhbCkge1xuICAgIHZhciBoYXNJbmRleE9mID0gKHZhbCAmJiB2YWwuaW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIHZhciB2YWxpZCA9IGhhc0luZGV4T2YgJiYgdmFsLmluZGV4T2YodmFsdWUpID4gLTE7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiRGF0YSBkb2VzIG5vdCBjb250YWluIHRoZSB2YWx1ZS5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjdXN0b21CdWlsZGVyKHZhbGlkYXRvckZ1bmN0aW9uKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvckZ1bmN0aW9uIGdpdmVuIGluIGl0c2EuY3VzdG9tKC4uLilcIjtcbiAgfVxuXG4gIHJldHVybiB2YWxpZGF0b3JGdW5jdGlvbi5iaW5kKHRoaXMpO1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkYXRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRhdGVDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNWYWxpZERhdGUodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIGRhdGVcIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRCdWlsZGVyIChkZWZhdWx0VmFsKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBkZWZhdWx0IHZhbHVlIHdhcyBnaXZlbiBpbiBgLmRlZmF1bHQoLi4uKWAuXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZGVmYXVsdFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICAvL21ha2Ugc3VyZSB0aGVyZSBpcyBhIHBhcmVudCBvYmplY3RcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLmRlZmF1bHQoLi4uKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0LlwiO1xuICAgIH1cblxuICAgIHZhciBpc0ZhbHN5ID0gIXZhbDtcbiAgICBpZiAoaXNGYWxzeSl7XG4gICAgICBzZXR0ZXIodHlwZW9mIGRlZmF1bHRWYWwgPT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbCgpIDogZGVmYXVsdFZhbCk7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0Tm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkZWZhdWx0Tm93UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAuZGVmYXVsdE5vdygpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG4gICAgfVxuXG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHNldHRlcihuZXcgRGF0ZSgpKTtcbiAgICB9XG4gIH07XG59OyIsIlxudmFyIHJ4ID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1haWxCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZW1haWxDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJOb3QgYW4gZW1haWwgYWRkcmVzcy5cIjtcbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbXB0eUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbXB0eUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIGNsYXNzVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gICAgaWYgKGhlbHBlcnMuaXNTdHJpbmcodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICB2YXIgbnVtYmVyT2ZGaWVsZHMgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBpZiAoIXZhbC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7IGNvbnRpbnVlOyB9XG4gICAgICAgIG51bWJlck9mRmllbGRzICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtYmVyT2ZGaWVsZHMgPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IG51bWJlciBvZiBmaWVsZHMgaXM6IFwiK251bWJlck9mRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBcIlR5cGUgY2Fubm90IGJlIGVtcHR5OiBcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmRzV2l0aEJ1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVuZHNXaXRoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmxhc3RJbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgaWYgKCFoYXNJbmRleE9mKSB7XG4gICAgICByZXR1cm4gXCJEYXRhIGhhcyBubyBsYXN0SW5kZXhPZiwgc28gdGhlcmUncyBubyB3YXkgdG8gY2hlY2sgYC5lbmRzV2l0aCgpYC5cIjtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gdmFsLmxhc3RJbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKXtcbiAgICAgIHJldHVybiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlTGVuZ3RoID0gKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkgfHwgMDtcbiAgICB2YWx1ZUxlbmd0aCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgPyB2YWx1ZUxlbmd0aCA6IDE7XG4gICAgLy9vdXRzaWRlIHZhbHVlIGlzIGEgc3RyaW5nIGFuZCBpbnNpZGUgdmFsdWUgaXMgYW4gZW1wdHkgc3RyaW5nPyB0aGF0J3MgZXZlcnl3aGVyZVxuICAgIGlmICh2YWx1ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciB2YWxpZCA9IGluZGV4ID09PSAodmFsLmxlbmd0aCAtIHZhbHVlTGVuZ3RoKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJEYXRhIGNvbnRhaW5zIHRoZSB2YWx1ZSwgYnV0IGRvZXMgbm90IGVuZCB3aXRoIGl0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVxdWFsQnVpbGRlcihleGFtcGxlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGNvbXBhcmlzb24gb2JqZWN0IGdpdmVuIGluIGl0c2EuZXF1YWwoLi4uKVwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGVxdWFsQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBleGFtcGxlID09PSB2YWw7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgZGlkIG5vdCBwYXNzIGVxdWFsaXR5IHRlc3QuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc2VDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IGZhbHNlID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGBmYWxzZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYWxzeUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmYWxzeUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuICF2YWwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgZmFsc3kuXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZnVuY3Rpb25CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZnVuY3Rpb25DaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNGdW5jdGlvbih2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBhIGZ1bmN0aW9uLlwiO1xuICB9O1xufTtcbiIsIlxudmFyIHJ4ID0gL15bMC05YS1mXSokL2k7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGV4QnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhleENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmIChbXCJzdHJpbmdcIiwgXCJudW1iZXJcIl0uaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIlZhbHVlIHNob3VsZCBiZSBoZXgsIGJ1dCBpc24ndCBhIHN0cmluZyBvciBudW1iZXIuXCI7XG4gICAgfVxuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgaGV4LlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlmQnVpbGRlcih0ZXN0LCBpdHNhSW5zdGFuY2UpIHtcbiAgLy92YWxpZGF0ZVxuICBpZiAoIWhlbHBlcnMuaXNQbGFpbk9iamVjdCh0ZXN0KSAmJiAhaGVscGVycy5pc0Z1bmN0aW9uKHRlc3QpKVxuICAgIHRocm93IFwiVGVzdCBhcmd1bWVudCBzaG91bGQgYmUgYSBmdW5jdGlvbiBvciBwbGFpbiBvYmplY3QuXCI7XG4gIGlmICghKGl0c2FJbnN0YW5jZSBpbnN0YW5jZW9mIHRoaXMuX2l0c2EpKVxuICAgIHRocm93IFwiYGlmYCByZXF1aXJlcyBhbiBpdHNhIGluc3RhbmNlIGFzIHRoZSBzZWNvbmQgYXJndW1lbnQuXCI7XG5cbiAgLy9jb252ZXJ0IG9iaiB0byBmdW5jdGlvbj9cbiAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdCh0ZXN0KSkge1xuICAgIHZhciB0ZXN0T2JqID0gdGVzdDtcbiAgICB0ZXN0ID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgaWYgKCFoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGVzdE9iaikge1xuICAgICAgICBpZiAoIXRlc3RPYmouaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cbiAgICAgICAgaWYgKHZhbFtrZXldICE9PSB0ZXN0T2JqW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGlmQ2hlY2tlcih2YWwpIHtcblxuICAgIGlmICghdGVzdCh2YWwpKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImlmXCIsIFwiQ29uZGl0aW9uIGZhaWxlZCBpbiBpZiBleHByZXNzaW9uLlwiLCB0cnVlKV1cbiAgICAgIH07XG5cbiAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsOyB9O1xuXG4gICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS5fdmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyXSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWxwaGFudW1lcmljXCI6IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljJyksXG4gIFwiYW55XCI6IHJlcXVpcmUoJy4vYW55JyksXG4gIFwiYXJnc1wiOiByZXF1aXJlKCcuL2FyZ3MnKSxcbiAgXCJhcnJheVwiOiByZXF1aXJlKCcuL2FycmF5JyksXG4gIFwiYXJyYXlPZlwiOiByZXF1aXJlKCcuL2FycmF5T2YnKSxcbiAgXCJiZXR3ZWVuXCI6IHJlcXVpcmUoJy4vYmV0d2VlbicpLFxuICBcImJvb2xlYW5cIjogcmVxdWlyZSgnLi9ib29sZWFuJyksXG4gIFwiY3VzdG9tXCI6IHJlcXVpcmUoJy4vY3VzdG9tJyksXG4gIFwiY29udGFpbnNcIjogcmVxdWlyZSgnLi9jb250YWlucycpLFxuICBcImRhdGVcIjogcmVxdWlyZSgnLi9kYXRlJyksXG4gIFwiZGVmYXVsdFwiOiByZXF1aXJlKCcuL2RlZmF1bHQnKSxcbiAgXCJkZWZhdWx0Tm93XCI6IHJlcXVpcmUoJy4vZGVmYXVsdE5vdycpLFxuICBcImVtYWlsXCI6IHJlcXVpcmUoJy4vZW1haWwnKSxcbiAgXCJlbXB0eVwiOiByZXF1aXJlKCcuL2VtcHR5JyksXG4gIFwiZW5kc1dpdGhcIjogcmVxdWlyZSgnLi9lbmRzV2l0aCcpLFxuICBcImVxdWFsXCI6IHJlcXVpcmUoJy4vZXF1YWwnKSxcbiAgXCJmYWxzZVwiOiByZXF1aXJlKCcuL2ZhbHNlJyksXG4gIFwiZmFsc3lcIjogcmVxdWlyZSgnLi9mYWxzeScpLFxuICBcImZ1bmN0aW9uXCI6IHJlcXVpcmUoJy4vZnVuY3Rpb24nKSxcbiAgXCJoZXhcIjogcmVxdWlyZSgnLi9oZXgnKSxcbiAgXCJpZlwiOiByZXF1aXJlKCcuL2lmJyksXG4gIFwiaW50ZWdlclwiOiByZXF1aXJlKCcuL2ludGVnZXInKSxcbiAgXCJpbnN0YW5jZW9mXCI6IHJlcXVpcmUoJy4vaW5zdGFuY2VvZicpLFxuICBcImpzb25cIjogcmVxdWlyZSgnLi9qc29uJyksXG4gIFwibGVuXCI6IHJlcXVpcmUoJy4vbGVuJyksXG4gIFwibG93ZXJjYXNlXCI6IHJlcXVpcmUoJy4vbG93ZXJjYXNlJyksXG4gIFwibWF0Y2hlc1wiOiByZXF1aXJlKCcuL21hdGNoZXMnKSxcbiAgXCJtYXhMZW5ndGhcIjogcmVxdWlyZSgnLi9tYXhMZW5ndGgnKSxcbiAgXCJtaW5MZW5ndGhcIjogcmVxdWlyZSgnLi9taW5MZW5ndGgnKSxcbiAgXCJuYW5cIjogcmVxdWlyZSgnLi9uYW4nKSxcbiAgXCJub3RFbXB0eVwiOiByZXF1aXJlKCcuL25vdEVtcHR5JyksXG4gIFwibnVsbFwiOiByZXF1aXJlKCcuL251bGwnKSxcbiAgXCJudW1iZXJcIjogcmVxdWlyZSgnLi9udW1iZXInKSxcbiAgXCJvYmplY3RcIjogcmVxdWlyZSgnLi9vYmplY3QnKSxcbiAgXCJvdmVyXCI6IHJlcXVpcmUoJy4vb3ZlcicpLFxuICBcInJlZ2V4cFwiOiByZXF1aXJlKCcuL3JlZ2V4cCcpLFxuICBcInN0YXJ0c1dpdGhcIjogcmVxdWlyZSgnLi9zdGFydHNXaXRoJyksXG4gIFwic3RyaW5nXCI6IHJlcXVpcmUoJy4vc3RyaW5nJyksXG4gIFwidG9cIjogcmVxdWlyZSgnLi90bycpLFxuICBcInRvRGF0ZVwiOiByZXF1aXJlKCcuL3RvRGF0ZScpLFxuICBcInRvRmxvYXRcIjogcmVxdWlyZSgnLi90b0Zsb2F0JyksXG4gIFwidG9JbnRlZ2VyXCI6IHJlcXVpcmUoJy4vdG9JbnRlZ2VyJyksXG4gIFwidG9Mb3dlcmNhc2VcIjogcmVxdWlyZSgnLi90b0xvd2VyY2FzZScpLFxuICBcInRvTm93XCI6IHJlcXVpcmUoJy4vdG9Ob3cnKSxcbiAgXCJ0b1N0cmluZ1wiOiByZXF1aXJlKCcuL3RvU3RyaW5nJyksXG4gIFwidG9UcmltbWVkXCI6IHJlcXVpcmUoJy4vdG9UcmltbWVkJyksXG4gIFwidG9VcHBlcmNhc2VcIjogcmVxdWlyZSgnLi90b1VwcGVyY2FzZScpLFxuICBcInRydWVcIjogcmVxdWlyZSgnLi90cnVlJyksXG4gIFwidHJ1dGh5XCI6IHJlcXVpcmUoJy4vdHJ1dGh5JyksXG4gIFwidHlwZW9mXCI6IHJlcXVpcmUoJy4vdHlwZW9mJyksXG4gIFwidW5kZWZpbmVkXCI6IHJlcXVpcmUoJy4vdW5kZWZpbmVkJyksXG4gIFwidW5kZXJcIjogcmVxdWlyZSgnLi91bmRlcicpLFxuICBcInVuaXF1ZVwiOiByZXF1aXJlKCcuL3VuaXF1ZScpLFxuICBcInVwcGVyY2FzZVwiOiByZXF1aXJlKCcuL3VwcGVyY2FzZScpXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zdGFuY2VvZkJ1aWxkZXIodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgXCJJbnZhbGlkIHR5cGUgZ2l2ZW4gdG8gYGl0c2EuaW5zdGFuY2VvZiguLi4pYDogXCIrdHlwZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gaW5zdGFuY2VvZkNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCkgPT09IHR5cGUucHJvdG90eXBlO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcImluc3RhbmNlb2YgY2hlY2sgZmFpbGVkLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGludGVnZXJCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gaW50ZWdlckNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIlxuICAgICAgICAmJiBpc05hTih2YWwpID09PSBmYWxzZVxuICAgICAgICAmJiBbTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFldLmluZGV4T2YodmFsKSA9PT0gLTFcbiAgICAgICAgJiYgdmFsICUgMSA9PT0gMDtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIGludGVnZXJcIjtcbiAgfTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ganNvbkJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBqc29uQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIFwiSlNPTiBtdXN0IGJlIGEgc3RyaW5nLlwiO1xuICAgIH1cblxuICAgIHRyeXtcbiAgICAgIEpTT04ucGFyc2UodmFsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1jYXRjaChlKXtcbiAgICAgIHJldHVybiBcIlZhbHVlIGlzIGEgbm90IHZhbGlkIEpTT04gc3RyaW5nLlwiO1xuICAgIH1cbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxlbkJ1aWxkZXIoZXhhY3RPck1pbiwgbWF4KSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIHZhciB2YWxpZGF0aW9uVHlwZSA9IFwidHJ1dGh5XCI7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkgdmFsaWRhdGlvblR5cGUgPSBcImV4YWN0XCI7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMikgdmFsaWRhdGlvblR5cGUgPSBcImJldHdlZW5cIjtcblxuICByZXR1cm4gZnVuY3Rpb24gbGVuQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCAodHlwZW9mIHZhbCkgPT09IFwic3RyaW5nXCIpID8gdmFsLmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwidHJ1dGh5XCIpe1xuICAgICAgcmV0dXJuIGxlbmd0aCA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgdHJ1dGh5LlwiO1xuICAgIH1lbHNlIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJleGFjdFwiKXtcbiAgICAgIHJldHVybiBsZW5ndGggPT09IGV4YWN0T3JNaW4gPyBudWxsIDogXCJMZW5ndGggaXMgbm90IGV4YWN0bHk6IFwiK2V4YWN0T3JNaW47XG4gICAgfWVsc2UgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcImJldHdlZW5cIil7XG4gICAgICB2YXIgdmFsaWQgPSBsZW5ndGggPj0gZXhhY3RPck1pbiAmJiBsZW5ndGggPD0gbWF4O1xuICAgICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCBiZXR3ZWVuIFwiK2V4YWN0T3JNaW4gK1wiIGFuZCBcIiArIG1heDtcbiAgICB9XG4gIH07XG59O1xuIiwiXG52YXIgcnggPSAvW0EtWl0vO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvd2VyY2FzZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBsb3dlcmNhc2VDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgJiYgIXJ4LnRlc3QodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBjb250YWlucyB1cHBlcmNhc2UgY2hhcmFjdGVycy5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1hdGNoZXNCdWlsZGVyKHJ4KSB7XG4gIGlmIChyeCBpbnN0YW5jZW9mIFJlZ0V4cCA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBcImAubWF0Y2hlcyguLi4pYCByZXF1aXJlcyBhIHJlZ2V4cFwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIG1hdGNoZXNDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHJ4LnRlc3QodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBkb2VzIG5vdCBtYXRjaCByZWdleHAuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1heCkge1xuICBpZiAodHlwZW9mIG1heCAhPSBcIm51bWJlclwiKSB7XG4gICAgdGhyb3cgXCJJbnZhbGlkIG1heGltdW0gaW4gbWF4TGVuZ3RoOiBcIittYXg7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgdmFyIGxlbmd0aCA9ICh2YWwgfHwgdHlwZSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoIDw9IG1heDtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwibWF4TGVuZ3RoXCIsIFwiTGVuZ3RoIGlzIFwiK2xlbmd0aCtcIiwgbWF4IGlzIFwiK21heCwgdmFsaWQpXSxcbiAgICB9O1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1pbkxlbmd0aEJ1aWxkZXIobWluKSB7XG4gIGlmICh0eXBlb2YgbWluICE9IFwibnVtYmVyXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgbWluaW11bSBpbiBtaW5MZW5ndGg6IFwiK21pbjtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gbWluTGVuZ3RoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgdmFyIGxlbmd0aCA9ICh2YWwgfHwgdHlwZSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID49IG1pbjtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogKFwiTGVuZ3RoIGlzIFwiK2xlbmd0aCtcIiwgbWluaW11bSBpcyBcIittaW4pO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5hbkJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBuYW5DaGVja2VyKHZhbCkge1xuICAgIHJldHVybiBpc05hTih2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IE5hTi5cIjtcbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3RFbXB0eUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBub3RFbXB0eUNoZWNrZXIodmFsKSB7XG5cbiAgICBpZiAoaGVscGVycy5pc1N0cmluZyh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCAhPT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIG5vdCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoICE9PSAwID8gbnVsbCA6IFwiQ2Fubm90IGJlIGVtcHR5LlwiO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgdmFyIG51bWJlck9mRmllbGRzID0gMDtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoa2V5KSkgeyBjb250aW51ZTsgfVxuXG4gICAgICAgIG51bWJlck9mRmllbGRzICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtYmVyT2ZGaWVsZHMgIT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBub3QgZW1wdHksIGJ1dCBudW1iZXIgb2YgZmllbGRzIGlzOiBcIitudW1iZXJPZkZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gXCJUeXBlIGNhbm5vdCBiZSBub3QtZW1wdHk6IFwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bGxCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbnVsbENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gbnVsbCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBudWxsLlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bWJlckJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBudW1iZXJDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNWYWxpZE51bWJlcih2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgbnVtYmVyXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFGaWVsZHMpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUZpZWxkcyA9IGFsbG93RXh0cmFGaWVsZHMgfHwgYXJncy5sZW5ndGggPT09IDA7XG5cbiAgLypcbiAgICogVGhlIGV4YW1wbGUgaXMgYW4gb2JqZWN0IHdoZXJlIHRoZSBrZXlzIGFyZSB0aGUgZmllbGQgbmFtZXNcbiAgICogYW5kIHRoZSB2YWx1ZXMgYXJlIGl0c2EgaW5zdGFuY2VzLlxuICAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgICovXG4gIGZvcih2YXIga2V5IGluIGV4YW1wbGUpIHtcbiAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2tleV0pO1xuICAgIGV4YW1wbGVba2V5XSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBrZXk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKTtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwib2JqZWN0XCIsIFwiVHlwZSB3YXM6IFwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy9leHRyYSBmaWVsZHMgbm90IGFsbG93ZWQ/XG4gICAgaWYgKGFsbG93RXh0cmFGaWVsZHMgPT09IGZhbHNlKSB7XG4gICAgICB2YXIgaW52YWxpZEZpZWxkcyA9IFtdO1xuICAgICAgZm9yKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIGlmICghdmFsLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuXG4gICAgICAgIGlmIChrZXkgaW4gZXhhbXBsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBpbnZhbGlkRmllbGRzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJvYmplY3RcIiwgXCJVbmV4cGVjdGVkIGZpZWxkczogXCIraW52YWxpZEZpZWxkcy5qb2luKCksIGZhbHNlKV1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IodmFyIGtleSBpbiBleGFtcGxlKSB7XG4gICAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2tleV07XG4gICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2tleV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxba2V5XSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb3ZlckJ1aWxkZXIobWluLCBpbmNsdXNpdmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG92ZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPj0gbWluID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBvdmVyIHRoZSBtaW5pbXVtIChpbmNsdXNpdmUpLlwiO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHZhbCA+IG1pbiA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3Qgb3ZlciB0aGUgbWluaW11bSAoZXhjbHVzaXZlKS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzUmVnRXhwKHZhbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcInJlZ2V4cFwiLCB2YWxpZD9cIlJlZ0V4cCB2ZXJpZmllZC5cIjpcIkV4cGVjdGVkIGEgUmVnRXhwLlwiLCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RhcnRzV2l0aEJ1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHN0YXJ0c1dpdGhDaGVja2VyKHZhbCkge1xuICAgIHZhciBoYXNJbmRleE9mID0gKHZhbCAmJiB2YWwuaW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIGlmICghaGFzSW5kZXhPZikge1xuICAgICAgcmV0dXJuIFwiRGF0YSBoYXMgbm8gaW5kZXhPZiwgc28gdGhlcmUncyBubyB3YXkgdG8gY2hlY2sgYC5zdGFydHNXaXRoKClgLlwiO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSB2YWwuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICByZXR1cm4gXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPT09IDAgPyBudWxsIDogXCJEYXRhIGNvbnRhaW5zIHRoZSB2YWx1ZSwgYnV0IGRvZXMgbm90IHN0YXJ0IHdpdGggaXQuXCI7XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzU3RyaW5nKHZhbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcInN0cmluZ1wiLCB2YWxpZD9cIlN0cmluZyBpZGVudGlmaWVkLlwiOlwiRXhwZWN0ZWQgYSBzdHJpbmcuXCIsIHZhbGlkKV1cbiAgICB9O1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvQnVpbGRlciAodmFsdWVPckdldHRlcikge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDApe1xuICAgIHRocm93IFwiTm8gZGVmYXVsdCB2YWx1ZSB3YXMgZ2l2ZW4gaW4gYC50byguLi4pYC5cIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiB0b1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLnRvKC4uLilgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBzZXR0ZXIodHlwZW9mIHZhbHVlT3JHZXR0ZXIgPT0gXCJmdW5jdGlvblwiID8gdmFsdWVPckdldHRlcigpIDogdmFsdWVPckdldHRlcik7XG4gIH07XG59OyIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0RhdGVCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvRGF0ZVJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvRGF0ZSgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAoIXZhbCkge1xuICAgICAgcmV0dXJuIFwiVW53aWxsaW5nIHRvIHBhcnNlIGZhbHN5IHZhbHVlcy5cIjtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiBcIlVud2lsbGluZyB0byBjcmVhdGUgZGF0ZSBmcm9tIGFycmF5cy5cIjtcbiAgICB9XG5cbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHZhbCk7XG4gICAgaWYgKGlzRmluaXRlKGRhdGUpKSB7XG4gICAgICBzZXR0ZXIoZGF0ZSk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gcGFyc2UgZGF0ZS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvRmxvYXRCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvRmxvYXRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b0Zsb2F0KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IHBhcnNlRmxvYXQodmFsKTtcbiAgICBpZiAodmFsID09PSBuZXdWYWx1ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChpc05hTihuZXdWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBcIlVuYWJsZSB0byBjb252ZXJ0IGRhdGEgdG8gZmxvYXQuXCI7XG4gICAgfWVsc2V7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0ludGVnZXJCdWlsZGVyIChyYWRpeCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9JbnRlZ2VyUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9JbnRlZ2VyKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZTtcbiAgICBpZiAoaGVscGVycy5pc1ZhbGlkRGF0ZSh2YWwpKSB7XG4gICAgICBuZXdWYWx1ZSA9IHZhbC5nZXRUaW1lKCk7XG4gICAgfWVsc2V7XG4gICAgICBuZXdWYWx1ZSA9IHBhcnNlSW50KHZhbCwgdHlwZW9mIHJhZGl4ID09PSBcInVuZGVmaW5lZFwiID8gMTAgOiByYWRpeCk7XG4gICAgfVxuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBpbnRlZ2VyLlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Mb3dlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTG93ZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9Mb3dlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvTm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b05vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLnRvTm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU3RyaW5nQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1N0cmluZ1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvU3RyaW5nKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IFN0cmluZyh2YWwpO1xuICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9UcmltbWVkQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1RyaW1tZWRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1RyaW1tZWQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50cmltKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9VcHBlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVXBwZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9VcHBlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydWVCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1ZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdHJ1ZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgdHJ1ZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cnV0aHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1dGh5Q2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHRydXRoeS5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHR5cGVvZkJ1aWxkZXIodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgIT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IFwiSW52YWxpZCB0eXBlIGdpdmVuIHRvIGBpdHNhLnR5cGVvZiguLi4pYDogXCIrdHlwZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gdHlwZW9mQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSB0eXBlO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJFeHBlY3RlZCB0eXBlIFwiK3R5cGUrXCIsIGJ1dCB0eXBlIGlzIFwiKyh0eXBlb2YgdmFsKSk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZWZpbmVkQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuZGVmaW5lZENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHVuZGVmaW5lZC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZGVyQnVpbGRlcihtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gdW5kZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCB1bmRlciB0aGUgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IHVuZGVyIHRoZSBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5pcXVlQnVpbGRlcihnZXR0ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuaXF1ZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgaXNUeXBlVmFsaWQgPSBoZWxwZXJzLmlzQXJyYXkodmFsKSB8fCBoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSB8fCBoZWxwZXJzLmlzU3RyaW5nKHZhbCk7XG4gICAgaWYgKCFpc1R5cGVWYWxpZCkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNoZWNrIHVuaXF1ZW5lc3Mgb24gdGhpcyB0eXBlIG9mIGRhdGEuXCI7XG4gICAgfVxuXG4gICAgdmFyIGdldHRlclR5cGUgPSBcIlwiO1xuICAgIGlmICh0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIpIHsgZ2V0dGVyVHlwZSA9IFwiZnVuY3Rpb25cIjsgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBnZXR0ZXIgIT09IFwidW5kZWZpbmVkXCIpIHsgZ2V0dGVyVHlwZSA9IFwicGx1Y2tcIjsgfVxuXG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoa2V5KSkgeyBjb250aW51ZTsgfVxuXG4gICAgICB2YXIgaXRlbSA9IHZhbFtrZXldO1xuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpdGVtID0gZ2V0dGVyKGl0ZW0pO1xuICAgICAgfVxuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwicGx1Y2tcIikge1xuICAgICAgICBpdGVtID0gaXRlbVtnZXR0ZXJdO1xuICAgICAgfVxuICAgICAgdmFyIGFscmVhZHlGb3VuZCA9IGl0ZW1zLmluZGV4T2YoaXRlbSkgPiAtMTtcbiAgICAgIGlmIChhbHJlYWR5Rm91bmQpIHtcbiAgICAgICAgcmV0dXJuIFwiSXRlbXMgYXJlIG5vdCB1bmlxdWUuXCI7XG4gICAgICB9XG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn07XG5cbiIsIlxudmFyIHJ4ID0gL1thLXpdLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1cHBlcmNhc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdXBwZXJjYXNlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiICYmICFyeC50ZXN0KHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgY29udGFpbnMgbG93ZXJjYXNlIGNoYXJhY3RlcnMuXCI7XG4gIH07XG59O1xuXG4iXX0=
