/*! 
  * @license 
  * itsa 1.2.5 <https://github.com/bendytree/node-itsa> 
  * Copyright 1/31/2015 Josh Wright <http://www.joshwright.com> 
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
  }

};

},{}],4:[function(require,module,exports){

var itsa = function () {
  //force `new`
  if (!(this instanceof itsa)) { return new itsa(); }

  this.validators = [];
  this.errorMessages = {};
};

// Private
itsa.prototype._buildLog = require("./methods/build-log");
itsa.prototype._buildFinalResult = require("./methods/build-final-result");
itsa.prototype._combineResults = require("./methods/combine-results");
itsa.prototype._convertValidatorToItsaInstance = require("./methods/convert-validator-to-itsa-instance");
itsa.prototype._validate = require("./methods/_validate");
itsa.prototype._itsa = itsa;

// Public
itsa.prototype.validate = require("./methods/validate");
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

},{"./aliases":2,"./methods/_validate":5,"./methods/alias":6,"./methods/build-final-result":7,"./methods/build-log":8,"./methods/combine-results":9,"./methods/convert-validator-to-itsa-instance":10,"./methods/extend":11,"./methods/msg":12,"./methods/validate":13,"./validators":34}],5:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function _validate(getter, setter) {
  var results = [];
  for (var i in this.validators) {
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

    //try a class type check
    var classTypeResult = runClassTypeValidator(validator, val);
    if (typeof classTypeResult !== "undefined"){
      return classTypeResult;
    }

    //a function? just run the function with the value
    if (typeof validator === "function"){
      return validator.call(itsaInstance, val, setter);
    }

    //something else, so this is a === check
    return val === validator;
  }catch(e){
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
    { cls: Function, validator: helpers.isFunction },
  ];
  for (var i in classMaps) {
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



module.exports = function validate(value) {
  return this._validate(function valueGetter(){
    return value;
  });
};

},{}],14:[function(require,module,exports){

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


},{}],15:[function(require,module,exports){

module.exports = function anyBuilder() {
  //combine validators
  var validators = [].concat.apply([].slice.call(arguments));
  if (validators.length === 0) {
    throw "No validators given in itsa.any()";
  }

  //convert all validators to real itsa instances
  for(var i in validators) {
    validators[i] = this._convertValidatorToItsaInstance(validators[i]);
  }

  return function anyChecker(val) {
    //find the first valid match
    var validResult = null;
    for(var i in validators) {
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


},{}],16:[function(require,module,exports){

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

},{"../helpers":3}],17:[function(require,module,exports){

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

},{"../helpers":3}],18:[function(require,module,exports){

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

},{"../helpers":3}],19:[function(require,module,exports){


module.exports = function betweenBuilder(min, max, inclusive) {
  return function betweenChecker(val) {
    if (inclusive) {
      return val >= min && val <= max ? null : "Value was not between minimum and maximum (inclusive).";
    }else{
      return val > min && val < max ? null : "Value was not between minimum and maximum (exclusive).";
    }
  };
};

},{}],20:[function(require,module,exports){


module.exports = function booleanBuilder() {
  return function booleanChecker(val) {
    var valid = typeof val === "boolean";
    return valid ? null : "Value is not a boolean.";
  };
};

},{}],21:[function(require,module,exports){


module.exports = function containsBuilder(value) {
  return function containsChecker(val) {
    var hasIndexOf = (val && val.indexOf) || (typeof val === "string");
    var valid = hasIndexOf && val.indexOf(value) > -1;
    return valid ? null : "Data does not contain the value.";
  };
};

},{}],22:[function(require,module,exports){


module.exports = function customBuilder(validatorFunction) {
  if (arguments.length === 0){
    throw "No validatorFunction given in itsa.custom(...)";
  }

  return validatorFunction.bind(this);
};

},{}],23:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function dateBuilder() {
  return function dateChecker(val) {
    var valid = helpers.isValidDate(val);
    return valid ? null : "Invalid date";
  };
};


},{"../helpers":3}],24:[function(require,module,exports){


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
},{}],25:[function(require,module,exports){


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
},{}],26:[function(require,module,exports){

var rx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function emailBuilder() {
  return function emailChecker(val) {
    return rx.test(val) ? null : "Not an email address.";
  };
};


},{}],27:[function(require,module,exports){

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
        numberOfFields += 1;
      }
      return numberOfFields === 0 ? null : "Expected empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be empty: "+Object.prototype.toString.call(val);
  };
};

},{"../helpers":3}],28:[function(require,module,exports){


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

},{}],29:[function(require,module,exports){


module.exports = function equalBuilder(example) {
  if (arguments.length === 0){
    throw "No comparison object given in itsa.equal(...)";
  }

  return function equalChecker(val) {
    var valid = example === val;
    return valid ? null : "Value did not pass equality test.";
  };
};

},{}],30:[function(require,module,exports){


module.exports = function falseBuilder() {
  return function falseChecker(val) {
    return val === false ? null : "Value is not `false`.";
  };
};


},{}],31:[function(require,module,exports){


module.exports = function falsyBuilder() {
  return function falsyChecker(val) {
    return !val ? null : "Value is not falsy.";
  };
};


},{}],32:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function functionBuilder() {
  return function functionChecker(val) {
    var valid = helpers.isFunction(val);
    return valid ? null : "Value is not a function.";
  };
};

},{"../helpers":3}],33:[function(require,module,exports){

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


},{}],34:[function(require,module,exports){

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
  "integer": require('./integer'),
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

},{"./alphanumeric":14,"./any":15,"./args":16,"./array":17,"./arrayOf":18,"./between":19,"./boolean":20,"./contains":21,"./custom":22,"./date":23,"./default":24,"./defaultNow":25,"./email":26,"./empty":27,"./endsWith":28,"./equal":29,"./false":30,"./falsy":31,"./function":32,"./hex":33,"./integer":35,"./json":36,"./len":37,"./lowercase":38,"./matches":39,"./maxLength":40,"./minLength":41,"./nan":42,"./notEmpty":43,"./null":44,"./number":45,"./object":46,"./over":47,"./regexp":48,"./startsWith":49,"./string":50,"./to":51,"./toDate":52,"./toFloat":53,"./toInteger":54,"./toLowercase":55,"./toNow":56,"./toString":57,"./toTrimmed":58,"./toUppercase":59,"./true":60,"./truthy":61,"./typeof":62,"./undefined":63,"./under":64,"./unique":65,"./uppercase":66}],35:[function(require,module,exports){


module.exports = function integerBuilder() {
  return function integerChecker(val) {
    var valid = typeof val === "number"
        && isNaN(val) === false
        && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
        && val % 1 === 0;
    return valid ? null : "Invalid integer";
  };
};

},{}],36:[function(require,module,exports){

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


},{}],37:[function(require,module,exports){


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

},{}],38:[function(require,module,exports){

var rx = /[A-Z]/;

module.exports = function lowercaseBuilder() {
  return function lowercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains uppercase characters.";
  };
};


},{}],39:[function(require,module,exports){


module.exports = function matchesBuilder(rx) {
  if (rx instanceof RegExp === false) {
    throw "`.matches(...)` requires a regexp";
  }

  return function matchesChecker(val) {
    var valid = rx.test(val);
    return valid ? null : "Value does not match regexp.";
  };
};

},{}],40:[function(require,module,exports){


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

},{}],41:[function(require,module,exports){


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

},{}],42:[function(require,module,exports){


module.exports = function nanBuilder() {
  return function nanChecker(val) {
    return isNaN(val) ? null : "Value is not NaN.";
  };
};


},{}],43:[function(require,module,exports){

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
        numberOfFields += 1;
      }
      return numberOfFields !== 0 ? null : "Expected not empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be not-empty: "+Object.prototype.toString.call(val);
  };
};

},{"../helpers":3}],44:[function(require,module,exports){


module.exports = function nullBuilder() {
  return function nullChecker(val) {
    return val === null ? null : "Value is not null.";
  };
};


},{}],45:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function numberBuilder() {
  return function numberChecker(val) {
    var valid = helpers.isValidNumber(val);
    return valid ? null : "Invalid number";
  };
};


},{"../helpers":3}],46:[function(require,module,exports){

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

},{"../helpers":3}],47:[function(require,module,exports){


module.exports = function overBuilder(min, inclusive) {
  return function overChecker(val) {
    if (inclusive) {
      return val >= min ? null : "Value was not over the minimum (inclusive).";
    }else{
      return val > min ? null : "Value was not over the minimum (exclusive).";
    }
  };
};

},{}],48:[function(require,module,exports){

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

},{"../helpers":3}],49:[function(require,module,exports){


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

},{}],50:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function () {
  return function (val) {
    var valid = helpers.isString(val);
    return {
      valid: valid,
      logs: [this._buildLog("string", valid?"String identified.":"Expected a string.", valid)],
    };
  };
};

},{"../helpers":3}],51:[function(require,module,exports){


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
},{}],52:[function(require,module,exports){

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

},{"../helpers":3}],53:[function(require,module,exports){

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

},{}],54:[function(require,module,exports){


module.exports = function toIntegerBuilder (radix) {
  return function toIntegerRunner (val, setter) {
    if (!setter) throw "`.toInteger()` may not be used unless it is within an object or array.";

    var newValue = parseInt(val, typeof radix === "undefined" ? 10 : radix);
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
},{}],55:[function(require,module,exports){


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
},{}],56:[function(require,module,exports){


module.exports = function toNowBuilder () {
  return function toNowRunner (val, setter) {
    if (!setter) {
      throw "`.toNow()` may not be used unless it is within an object or array.";
    }

    setter(new Date());
  };
};
},{}],57:[function(require,module,exports){


module.exports = function toStringBuilder () {
  return function toStringRunner (val, setter) {
    if (!setter) throw "`.toString()` may not be used unless it is within an object or array.";

    var newValue = String(val);
    if (val !== newValue) {
      setter(newValue);
    }
  };
};
},{}],58:[function(require,module,exports){


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
},{}],59:[function(require,module,exports){


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
},{}],60:[function(require,module,exports){


module.exports = function trueBuilder() {
  return function trueChecker(val) {
    return val === true ? null : "Value is not `true`.";
  };
};


},{}],61:[function(require,module,exports){


module.exports = function truthyBuilder() {
  return function truthyChecker(val) {
    return val ? null : "Value is not truthy.";
  };
};


},{}],62:[function(require,module,exports){


module.exports = function typeofBuilder(type) {
  if (typeof type != "string") {
    throw "Invalid type given to `itsa.typeof(...)`: "+type;
  }
  return function typeofChecker(val) {
    var valid = typeof val === type;
    return valid ? null : ("Expected type "+type+", but type is "+(typeof val));
  };
};

},{}],63:[function(require,module,exports){


module.exports = function undefinedBuilder() {
  return function undefinedChecker(val) {
    return val === undefined ? null : "Value is not undefined.";
  };
};


},{}],64:[function(require,module,exports){


module.exports = function underBuilder(max, inclusive) {
  return function underChecker(val) {
    if (inclusive) {
      return val <= max ? null : "Value was not under the maximum (inclusive).";
    }else{
      return val < max ? null : "Value was not under the maximum (exclusive).";
    }
  };
};

},{}],65:[function(require,module,exports){

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


},{"../helpers":3}],66:[function(require,module,exports){

var rx = /[a-z]/;

module.exports = function uppercaseBuilder() {
  return function uppercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains lowercase characters.";
  };
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2hlbHBlcnMuanMiLCJsaWIvaXRzYS5qcyIsImxpYi9tZXRob2RzL192YWxpZGF0ZS5qcyIsImxpYi9tZXRob2RzL2FsaWFzLmpzIiwibGliL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0LmpzIiwibGliL21ldGhvZHMvYnVpbGQtbG9nLmpzIiwibGliL21ldGhvZHMvY29tYmluZS1yZXN1bHRzLmpzIiwibGliL21ldGhvZHMvY29udmVydC12YWxpZGF0b3ItdG8taXRzYS1pbnN0YW5jZS5qcyIsImxpYi9tZXRob2RzL2V4dGVuZC5qcyIsImxpYi9tZXRob2RzL21zZy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvYWxwaGFudW1lcmljLmpzIiwibGliL3ZhbGlkYXRvcnMvYW55LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJncy5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9mdW5jdGlvbi5qcyIsImxpYi92YWxpZGF0b3JzL2hleC5qcyIsImxpYi92YWxpZGF0b3JzL2luZGV4LmpzIiwibGliL3ZhbGlkYXRvcnMvaW50ZWdlci5qcyIsImxpYi92YWxpZGF0b3JzL2pzb24uanMiLCJsaWIvdmFsaWRhdG9ycy9sZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9sb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy9tYXRjaGVzLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF4TGVuZ3RoLmpzIiwibGliL3ZhbGlkYXRvcnMvbWluTGVuZ3RoLmpzIiwibGliL3ZhbGlkYXRvcnMvbmFuLmpzIiwibGliL3ZhbGlkYXRvcnMvbm90RW1wdHkuanMiLCJsaWIvdmFsaWRhdG9ycy9udWxsLmpzIiwibGliL3ZhbGlkYXRvcnMvbnVtYmVyLmpzIiwibGliL3ZhbGlkYXRvcnMvb2JqZWN0LmpzIiwibGliL3ZhbGlkYXRvcnMvb3Zlci5qcyIsImxpYi92YWxpZGF0b3JzL3JlZ2V4cC5qcyIsImxpYi92YWxpZGF0b3JzL3N0YXJ0c1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9zdHJpbmcuanMiLCJsaWIvdmFsaWRhdG9ycy90by5qcyIsImxpYi92YWxpZGF0b3JzL3RvRGF0ZS5qcyIsImxpYi92YWxpZGF0b3JzL3RvRmxvYXQuanMiLCJsaWIvdmFsaWRhdG9ycy90b0ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy90b0xvd2VyY2FzZS5qcyIsImxpYi92YWxpZGF0b3JzL3RvTm93LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9TdHJpbmcuanMiLCJsaWIvdmFsaWRhdG9ycy90b1RyaW1tZWQuanMiLCJsaWIvdmFsaWRhdG9ycy90b1VwcGVyY2FzZS5qcyIsImxpYi92YWxpZGF0b3JzL3RydWUuanMiLCJsaWIvdmFsaWRhdG9ycy90cnV0aHkuanMiLCJsaWIvdmFsaWRhdG9ycy90eXBlb2YuanMiLCJsaWIvdmFsaWRhdG9ycy91bmRlZmluZWQuanMiLCJsaWIvdmFsaWRhdG9ycy91bmRlci5qcyIsImxpYi92YWxpZGF0b3JzL3VuaXF1ZS5qcyIsImxpYi92YWxpZGF0b3JzL3VwcGVyY2FzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvaXRzYVwiKTtcbiIsIlxuLyoqXG4gKiBBIGxpc3Qgb2YgYnVpbHQgaW4gYWxpYXNlcyBmb3IgaXRzYSB2YWxpZGF0b3JzLlxuICpcbiAqIHsgXCJhbGlhc05hbWVcIiA6IFwicmVhbE5hbWVcIiB9XG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImFmdGVyXCI6IFwib3ZlclwiLFxuICBcImJlZm9yZVwiOiBcInVuZGVyXCJcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNCb29sZWFuOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgQm9vbGVhbl1cIjtcbiAgfSxcblxuICBpc1ZhbGlkRGF0ZTogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IERhdGVdXCIgJiYgaXNGaW5pdGUodmFsKTtcbiAgfSxcblxuICBpc1JlZ0V4cDogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIjtcbiAgfSxcblxuICBpc0Z1bmN0aW9uOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgRnVuY3Rpb25dXCI7XG4gIH0sXG5cbiAgaXNBcnJheTogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICB9LFxuXG4gIGlzUGxhaW5PYmplY3Q6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gIH0sXG5cbiAgaXNTdHJpbmc6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBTdHJpbmddXCI7XG4gIH0sXG5cbiAgaXNWYWxpZE51bWJlcjogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiXG4gICAgICAmJiBpc05hTih2YWwpID09PSBmYWxzZVxuICAgICAgJiYgW051bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXS5pbmRleE9mKHZhbCkgPT09IC0xO1xuICB9LFxuXG4gIGlzQXJndW1lbnRzOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgQXJndW1lbnRzXVwiKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy9mb3IgT3BlcmFcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiAoIFwiY2FsbGVlXCIgaW4gdmFsICkgJiYgdHlwZW9mIHZhbC5sZW5ndGggPT09IFwibnVtYmVyXCI7XG4gIH1cblxufTtcbiIsIlxudmFyIGl0c2EgPSBmdW5jdGlvbiAoKSB7XG4gIC8vZm9yY2UgYG5ld2BcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGl0c2EpKSB7IHJldHVybiBuZXcgaXRzYSgpOyB9XG5cbiAgdGhpcy52YWxpZGF0b3JzID0gW107XG4gIHRoaXMuZXJyb3JNZXNzYWdlcyA9IHt9O1xufTtcblxuLy8gUHJpdmF0ZVxuaXRzYS5wcm90b3R5cGUuX2J1aWxkTG9nID0gcmVxdWlyZShcIi4vbWV0aG9kcy9idWlsZC1sb2dcIik7XG5pdHNhLnByb3RvdHlwZS5fYnVpbGRGaW5hbFJlc3VsdCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0XCIpO1xuaXRzYS5wcm90b3R5cGUuX2NvbWJpbmVSZXN1bHRzID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb21iaW5lLXJlc3VsdHNcIik7XG5pdHNhLnByb3RvdHlwZS5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb252ZXJ0LXZhbGlkYXRvci10by1pdHNhLWluc3RhbmNlXCIpO1xuaXRzYS5wcm90b3R5cGUuX3ZhbGlkYXRlID0gcmVxdWlyZShcIi4vbWV0aG9kcy9fdmFsaWRhdGVcIik7XG5pdHNhLnByb3RvdHlwZS5faXRzYSA9IGl0c2E7XG5cbi8vIFB1YmxpY1xuaXRzYS5wcm90b3R5cGUudmFsaWRhdGUgPSByZXF1aXJlKFwiLi9tZXRob2RzL3ZhbGlkYXRlXCIpO1xuaXRzYS5wcm90b3R5cGUubXNnID0gcmVxdWlyZShcIi4vbWV0aG9kcy9tc2dcIik7XG5pdHNhLmV4dGVuZCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvZXh0ZW5kXCIpO1xuaXRzYS5hbGlhcyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYWxpYXNcIik7XG5cbi8vIEJ1aWx0IGluIHZhbGlkYXRvcnNcbml0c2EuZXh0ZW5kKHJlcXVpcmUoXCIuL3ZhbGlkYXRvcnNcIikpO1xuXG4vLyBBZGQgYWxpYXNlc1xudmFyIGFsaWFzZXMgPSByZXF1aXJlKFwiLi9hbGlhc2VzXCIpO1xuZm9yICh2YXIga2V5IGluIGFsaWFzZXMpe1xuICBpdHNhLmFsaWFzKGFsaWFzZXNba2V5XSwga2V5KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0c2E7XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX3ZhbGlkYXRlKGdldHRlciwgc2V0dGVyKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGZvciAodmFyIGkgaW4gdGhpcy52YWxpZGF0b3JzKSB7XG4gICAgdmFyIHZhbGlkYXRvciA9IHRoaXMudmFsaWRhdG9yc1tpXTtcblxuICAgIC8vZ2V0IHJlc3VsdFxuICAgIHZhciByZXN1bHQgPSBydW5WYWxpZGF0b3IodGhpcywgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICAvL2ludGVycHJldCByZXN1bHRcbiAgICByZXN1bHQgPSBpbnRlcnByZXRSZXN1bHQodGhpcywgcmVzdWx0KTtcblxuICAgIC8vY3VzdG9tIGVycm9yXG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UgJiYgdGhpcy5lcnJvck1lc3NhZ2VzW3ZhbGlkYXRvcl0pe1xuICAgICAgcmVzdWx0LmxvZ3NbMF0uY3VzdG9tTWVzc2FnZSA9IHRoaXMuZXJyb3JNZXNzYWdlc1t2YWxpZGF0b3JdO1xuICAgIH1cblxuICAgIC8vYWRkIGl0IHRvIGxpc3Qgb2YgcmVzdWx0c1xuICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuXG4gICAgLy9pbnZhbGlkPyBzaG9ydCBjaXJjdWl0XG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UpIHsgYnJlYWs7IH1cbiAgfVxuICByZXR1cm4gdGhpcy5fYnVpbGRGaW5hbFJlc3VsdCh0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKSk7XG59O1xuXG52YXIgcnVuVmFsaWRhdG9yID0gZnVuY3Rpb24gKGl0c2FJbnN0YW5jZSwgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcikge1xuICB0cnl7XG4gICAgLy9hbHJlYWR5IGFuIGl0c2EgaW5zdGFuY2U/IGp1c3QgcnVuIHZhbGlkYXRlXG4gICAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwib2JqZWN0XCIgJiYgdmFsaWRhdG9yIGluc3RhbmNlb2YgaXRzYUluc3RhbmNlLl9pdHNhKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdG9yLnZhbGlkYXRlKGdldHRlciwgc2V0dGVyKTtcbiAgICB9XG5cbiAgICAvL3RpbWUgdG8gZ2V0IHRoZSByZWFsIHZhbHVlIChjb3VsZCBiZSBhIHZhbHVlIG9yIGEgZnVuY3Rpb24pXG4gICAgdmFyIHZhbCA9IHR5cGVvZiBnZXR0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IGdldHRlcigpIDogZ2V0dGVyO1xuXG4gICAgLy90cnkgYSBjbGFzcyB0eXBlIGNoZWNrXG4gICAgdmFyIGNsYXNzVHlwZVJlc3VsdCA9IHJ1bkNsYXNzVHlwZVZhbGlkYXRvcih2YWxpZGF0b3IsIHZhbCk7XG4gICAgaWYgKHR5cGVvZiBjbGFzc1R5cGVSZXN1bHQgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgcmV0dXJuIGNsYXNzVHlwZVJlc3VsdDtcbiAgICB9XG5cbiAgICAvL2EgZnVuY3Rpb24/IGp1c3QgcnVuIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSB2YWx1ZVxuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgcmV0dXJuIHZhbGlkYXRvci5jYWxsKGl0c2FJbnN0YW5jZSwgdmFsLCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIC8vc29tZXRoaW5nIGVsc2UsIHNvIHRoaXMgaXMgYSA9PT0gY2hlY2tcbiAgICByZXR1cm4gdmFsID09PSB2YWxpZGF0b3I7XG4gIH1jYXRjaChlKXtcbiAgICByZXR1cm4gXCJVbmhhbmRsZWQgZXJyb3IuIFwiK1N0cmluZyhlKTtcbiAgfVxufTtcblxudmFyIGludGVycHJldFJlc3VsdCA9IGZ1bmN0aW9uIChpdHNhSW5zdGFuY2UsIHJlc3VsdCkge1xuICAvL3Jlc3VsdCBpcyBhIGJvb2xlYW4/XG4gIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcImJvb2xlYW5cIikge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogcmVzdWx0LFxuICAgICAgbG9nczogW2l0c2FJbnN0YW5jZS5fYnVpbGRMb2coXCJmdW5jdGlvblwiLCByZXN1bHQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOlwiVmFsaWRhdGlvbiBmYWlsZWRcIiwgcmVzdWx0KV1cbiAgICB9O1xuICB9XG5cbiAgLy9yZXN1bHQgaXMgYW4gb2JqZWN0P1xuICBpZiAoaGVscGVycy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy9vdGhlcndpc2UgaW50ZXJwcmV0IGl0IGFzIHN0cmluZz1lcnJvclxuICB2YXIgdmFsaWQgPSB0eXBlb2YgcmVzdWx0ICE9PSBcInN0cmluZ1wiIHx8ICFyZXN1bHQ7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbGlkLFxuICAgIGxvZ3M6IFtpdHNhSW5zdGFuY2UuX2J1aWxkTG9nKFwiZnVuY3Rpb25cIiwgdmFsaWQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOnJlc3VsdCwgdmFsaWQpXVxuICB9O1xufTtcblxudmFyIHJ1bkNsYXNzVHlwZVZhbGlkYXRvciA9IGZ1bmN0aW9uKGNscywgdmFsKSB7XG4gIHZhciBjbGFzc01hcHMgPSBbXG4gICAgeyBjbHM6IEJvb2xlYW4sIHZhbGlkYXRvcjogaGVscGVycy5pc0Jvb2xlYW4gfSxcbiAgICB7IGNsczogU3RyaW5nLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNTdHJpbmcgfSxcbiAgICB7IGNsczogTnVtYmVyLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNWYWxpZE51bWJlciB9LFxuICAgIHsgY2xzOiBPYmplY3QsIHZhbGlkYXRvcjogaGVscGVycy5pc1BsYWluT2JqZWN0IH0sXG4gICAgeyBjbHM6IERhdGUsIHZhbGlkYXRvcjogaGVscGVycy5pc1ZhbGlkRGF0ZSB9LFxuICAgIHsgY2xzOiBBcnJheSwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzQXJyYXkgfSxcbiAgICB7IGNsczogUmVnRXhwLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNSZWdFeHAgfSxcbiAgICB7IGNsczogRnVuY3Rpb24sIHZhbGlkYXRvcjogaGVscGVycy5pc0Z1bmN0aW9uIH0sXG4gIF07XG4gIGZvciAodmFyIGkgaW4gY2xhc3NNYXBzKSB7XG4gICAgdmFyIGNsYXNzTWFwID0gY2xhc3NNYXBzW2ldO1xuICAgIGlmIChjbHMgPT09IGNsYXNzTWFwLmNscykge1xuICAgICAgcmV0dXJuIGNsYXNzTWFwLnZhbGlkYXRvcih2YWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYWxpYXMob2xkTmFtZSwgbmV3TmFtZSkge1xuICB0aGlzW25ld05hbWVdID0gdGhpcy5wcm90b3R5cGVbbmV3TmFtZV0gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzW29sZE5hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn07XG4iLCJcbnZhciBGaW5hbFJlc3VsdCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgdGhpcy52YWxpZCA9IHJlc3VsdC52YWxpZDtcbiAgdGhpcy5sb2dzID0gcmVzdWx0LmxvZ3M7XG59O1xuXG5GaW5hbFJlc3VsdC5wcm90b3R5cGUuZGVzY3JpYmUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vdmFsaWQ/IGNvb2wgc3RvcnkgYnJvXG4gIGlmICh0aGlzLnZhbGlkKSB7XG4gICAgcmV0dXJuIFwiVmFsaWRhdGlvbiBzdWNjZWVkZWQuXCI7XG4gIH1cblxuICAvL2ludmFsaWRcbiAgdmFyIG1lc3NhZ2VzID0gW107XG4gIGZvciAodmFyIGkgaW4gdGhpcy5sb2dzKXtcbiAgICB2YXIgbG9nID0gdGhpcy5sb2dzW2ldO1xuICAgIGlmIChsb2cudmFsaWQpIGNvbnRpbnVlO1xuICAgIGlmIChsb2cuY3VzdG9tTWVzc2FnZSkge1xuICAgICAgbWVzc2FnZXMucHVzaChsb2cuY3VzdG9tTWVzc2FnZSk7XG4gICAgfWVsc2V7XG4gICAgICBtZXNzYWdlcy5wdXNoKChsb2cucGF0aCA/IChsb2cucGF0aCArIFwiOiBcIikgOiBcIlwiKSArIGxvZy5tZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZXMuam9pbihcIlxcblwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICByZXR1cm4gbmV3IEZpbmFsUmVzdWx0KHJlc3VsdCk7XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbGlkYXRvciwgbXNnLCB2YWxpZCkge1xuICB2YXIgcGF0aHMgPSBbXTtcbiAgdmFyIG5vZGUgPSB0aGlzO1xuICB3aGlsZSAobm9kZSAmJiBub2RlLl9rZXkpIHtcbiAgICBwYXRocy5zcGxpY2UoMCwgMCwgbm9kZS5fa2V5KTtcbiAgICBub2RlID0gbm9kZS5fcGFyZW50O1xuICB9XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbGlkLFxuICAgIHBhdGg6IHBhdGhzLmpvaW4oXCIuXCIpLFxuICAgIHZhbGlkYXRvcjogdmFsaWRhdG9yLFxuICAgIG1lc3NhZ2U6IG1zZyxcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzdWx0cykge1xuICAvL29uZSByZXN1bHQ/IHNob3J0Y3V0XG4gIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiByZXN1bHRzWzBdO1xuICB9XG5cbiAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgdmFyIGxvZ3MgPSBbXTtcblxuICBmb3IgKHZhciBpIGluIHJlc3VsdHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICB2YWxpZCA9IHZhbGlkICYmIHJlc3VsdC52YWxpZDtcblxuICAgIGlmIChyZXN1bHQubG9ncyAmJiByZXN1bHQubG9ncy5sZW5ndGgpIHtcbiAgICAgIGxvZ3MucHVzaC5hcHBseShsb2dzLCByZXN1bHQubG9ncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHZhbGlkLCBsb2dzOiBsb2dzIH07XG59OyIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yKSB7XG4gIC8vYWxyZWFkeSBhbiBgaXRzYWAgaW5zdGFuY2U/XG4gIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcIm9iamVjdFwiICYmIHZhbGlkYXRvciBpbnN0YW5jZW9mIHRoaXMuX2l0c2EpIHtcbiAgICByZXR1cm4gdmFsaWRhdG9yO1xuICB9XG5cbiAgLy9ub3QgYW4gaW5zdGFuY2UgeWV0LCBzbyBjcmVhdGUgb25lXG4gIHZhciBpbnN0YW5jZSA9IG5ldyB0aGlzLl9pdHNhKCk7XG4gIGluc3RhbmNlLnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICByZXR1cm4gaW5zdGFuY2U7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZChleHRlbnNpb25zKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gZXh0ZW5zaW9ucykge1xuICAgIC8vaWdub3JlIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gICAgaWYgKCFleHRlbnNpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICBhc3NpZ24odGhpcywgbmFtZSwgZXh0ZW5zaW9uc1tuYW1lXSk7XG4gIH1cbn07XG5cbnZhciBhc3NpZ24gPSBmdW5jdGlvbiAoaXRzYSwgbmFtZSwgYnVpbGRlcikge1xuXG4gIC8qKlxuICAgKiBBbGxvd3Mgc3RhdGljIGFjY2VzcyAtIGxpa2UgYGl0c2Euc3RyaW5nKClgXG4gICAqL1xuICBpdHNhW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBpdHNhKCk7XG4gICAgaW5zdGFuY2UudmFsaWRhdG9ycyA9IFtidWlsZGVyLmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpXTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFsbG93cyBjaGFpbmluZyAtIGxpa2UgYGl0c2Euc29tZXRoaW5nKCkuc3RyaW5nKClgXG4gICAqL1xuICBpdHNhLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbGlkYXRvcnMucHVzaChidWlsZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbXNnKG1zZykge1xuICBpZiAodHlwZW9mIG1zZyAhPT0gXCJzdHJpbmdcIiB8fCAhbXNnKSB7XG4gICAgdGhyb3cgXCIubXNnKC4uLikgbXVzdCBiZSBnaXZlbiBhbiBlcnJvciBtZXNzYWdlXCI7XG4gIH1cblxuICB0aGlzLmVycm9yTWVzc2FnZXNbdGhpcy52YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9ycy5sZW5ndGgtMV1dID0gbXNnO1xuXG4gIHJldHVybiB0aGlzO1xufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRhdGUodmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlKGZ1bmN0aW9uIHZhbHVlR2V0dGVyKCl7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG4iLCJcbnZhciByeCA9IC9eWzAtOWEtel0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFscGhhbnVtZXJpY0J1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhbHBoYW51bWVyaWNDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgYWxwaGFudW1lcmljLCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGFscGhhbnVtZXJpYy5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbnlCdWlsZGVyKCkge1xuICAvL2NvbWJpbmUgdmFsaWRhdG9yc1xuICB2YXIgdmFsaWRhdG9ycyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAodmFsaWRhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvcnMgZ2l2ZW4gaW4gaXRzYS5hbnkoKVwiO1xuICB9XG5cbiAgLy9jb252ZXJ0IGFsbCB2YWxpZGF0b3JzIHRvIHJlYWwgaXRzYSBpbnN0YW5jZXNcbiAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICB2YWxpZGF0b3JzW2ldID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKHZhbGlkYXRvcnNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGFueUNoZWNrZXIodmFsKSB7XG4gICAgLy9maW5kIHRoZSBmaXJzdCB2YWxpZCBtYXRjaFxuICAgIHZhciB2YWxpZFJlc3VsdCA9IG51bGw7XG4gICAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSB2YWxpZGF0b3JzW2ldO1xuXG4gICAgICAvL3NldCBzYW1lIGNvbnRleHQgb24gY2hpbGRyZW5cbiAgICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuICAgICAgaXRzYUluc3RhbmNlLl9rZXkgPSB0aGlzLl9rZXk7XG5cbiAgICAgIC8vZXhlY3V0ZSB2YWxpZGF0b3IgJiBzdG9wIGlmIHZhbGlkXG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLnZhbGlkYXRlKHZhbCk7XG4gICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgIHZhbGlkUmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3NlbmQgYmFjayB0aGUgcmVzdWx0XG4gICAgaWYgKHZhbGlkUmVzdWx0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMoW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYW55XCIsIFwiTWF0Y2ggZm91bmQuXCIsIHRydWUpXVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZFJlc3VsdFxuICAgICAgXSk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFueVwiLCBcIk5vIG1hdGNoZXMgZm91bmQuXCIsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcmdzQnVpbGRlcihleGFtcGxlLCBhbGxvd0V4dHJhSXRlbXMpIHtcbiAgLy9leGFtcGxlIGlzIG1pc3Npbmcgb3IgYW4gYXJyYXlcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUl0ZW1zID0gYWxsb3dFeHRyYUl0ZW1zIHx8IGFyZ3MubGVuZ3RoID09PSAwO1xuICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGlzRXhhbXBsZUFycmF5ID0gaGVscGVycy5pc0FycmF5KGV4YW1wbGUpO1xuICAgIGlmICghaXNFeGFtcGxlQXJyYXkpIHtcbiAgICAgIHRocm93IFwiaW4gYC5hcmd1bWVudHMoZXhhbXBsZSlgLCBleGFtcGxlIG11c3QgYmUgb21pdHRlZCBvciBhbiBhcnJheVwiO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogVGhlIGV4YW1wbGUgaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBpdGVtIGlzIGEgdmFsaWRhdG9yLlxuICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAqL1xuICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZVtpXSk7XG4gICAgZXhhbXBsZVtpXSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBTdHJpbmcoaSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gYXJnc0NoZWNrZXIodmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzQXJndW1lbnRzKHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFyZ3VtZW50c1wiLCBcIlR5cGUgd2FzIDpcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIC8vdG9vIG1hbnkgaXRlbXMgaW4gYXJyYXk/XG4gICAgaWYgKGFsbG93RXh0cmFJdGVtcyA9PT0gZmFsc2UgJiYgdmFsLmxlbmd0aCA+IGV4YW1wbGUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiRXhhbXBsZSBoYXMgXCIrZXhhbXBsZS5sZW5ndGgrXCIgaXRlbXMsIGJ1dCBkYXRhIGhhcyBcIit2YWwubGVuZ3RoLCBmYWxzZSldXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZvcih2YXIgaSBpbiBleGFtcGxlKSB7XG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gZXhhbXBsZVtpXTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxbaV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFJdGVtcykge1xuICAvL2V4YW1wbGUgaXMgbWlzc2luZyBvciBhbiBhcnJheVxuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBhbGxvd0V4dHJhSXRlbXMgPSBhbGxvd0V4dHJhSXRlbXMgfHwgYXJncy5sZW5ndGggPT09IDA7XG4gIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgaXNFeGFtcGxlQXJyYXkgPSBoZWxwZXJzLmlzQXJyYXkoZXhhbXBsZSk7XG4gICAgaWYgKCFpc0V4YW1wbGVBcnJheSkge1xuICAgICAgdGhyb3cgXCJpbiBgLmFycmF5KGV4YW1wbGUpYCwgZXhhbXBsZSBtdXN0IGJlIG9taXR0ZWQgb3IgYW4gYXJyYXlcIjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoZSBleGFtcGxlIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggaXRlbSBpcyBhIHZhbGlkYXRvci5cbiAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgKi9cbiAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGVbaV0pO1xuICAgIGV4YW1wbGVbaV0gPSBpdHNhSW5zdGFuY2U7XG4gICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gU3RyaW5nKGkpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgLy8gdHlwZW9mIFtdLCBudWxsLCBldGMgYXJlIG9iamVjdCwgc28gdXNlIHRoaXMgY2hlY2sgZm9yIGFjdHVhbCBvYmplY3RzXG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc0FycmF5KHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiVHlwZSB3YXMgOlwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy90b28gbWFueSBpdGVtcyBpbiBhcnJheT9cbiAgICBpZiAoYWxsb3dFeHRyYUl0ZW1zID09PSBmYWxzZSAmJiB2YWwubGVuZ3RoID4gZXhhbXBsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJFeGFtcGxlIGhhcyBcIitleGFtcGxlLmxlbmd0aCtcIiBpdGVtcywgYnV0IGRhdGEgaGFzIFwiK3ZhbC5sZW5ndGgsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2ldO1xuICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtpXSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICB2YXIgZG9WYWxpZGF0ZUl0ZW1zID0gYXJncy5sZW5ndGggPiAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNBcnJheSh2YWwpO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcnJheVwiLCBcIlR5cGUgd2FzIDpcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIGlmIChkb1ZhbGlkYXRlSXRlbXMpIHtcbiAgICAgIGZvcih2YXIgaSBpbiB2YWwpIHtcbiAgICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlKTtcbiAgICAgICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgICAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2ldID0gbmV3VmFsOyB9O1xuICAgICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmV0d2VlbkJ1aWxkZXIobWluLCBtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gYmV0d2VlbkNoZWNrZXIodmFsKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcmV0dXJuIHZhbCA+PSBtaW4gJiYgdmFsIDw9IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgYmV0d2VlbiBtaW5pbXVtIGFuZCBtYXhpbXVtIChpbmNsdXNpdmUpLlwiO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHZhbCA+IG1pbiAmJiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IGJldHdlZW4gbWluaW11bSBhbmQgbWF4aW11bSAoZXhjbHVzaXZlKS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYm9vbGVhbkJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBib29sZWFuQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcImJvb2xlYW5cIjtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYSBib29sZWFuLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbnRhaW5zQnVpbGRlcih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gY29udGFpbnNDaGVja2VyKHZhbCkge1xuICAgIHZhciBoYXNJbmRleE9mID0gKHZhbCAmJiB2YWwuaW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIHZhciB2YWxpZCA9IGhhc0luZGV4T2YgJiYgdmFsLmluZGV4T2YodmFsdWUpID4gLTE7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiRGF0YSBkb2VzIG5vdCBjb250YWluIHRoZSB2YWx1ZS5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjdXN0b21CdWlsZGVyKHZhbGlkYXRvckZ1bmN0aW9uKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvckZ1bmN0aW9uIGdpdmVuIGluIGl0c2EuY3VzdG9tKC4uLilcIjtcbiAgfVxuXG4gIHJldHVybiB2YWxpZGF0b3JGdW5jdGlvbi5iaW5kKHRoaXMpO1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkYXRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRhdGVDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNWYWxpZERhdGUodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIGRhdGVcIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRCdWlsZGVyIChkZWZhdWx0VmFsKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBkZWZhdWx0IHZhbHVlIHdhcyBnaXZlbiBpbiBgLmRlZmF1bHQoLi4uKWAuXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZGVmYXVsdFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICAvL21ha2Ugc3VyZSB0aGVyZSBpcyBhIHBhcmVudCBvYmplY3RcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLmRlZmF1bHQoLi4uKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0LlwiO1xuICAgIH1cblxuICAgIHZhciBpc0ZhbHN5ID0gIXZhbDtcbiAgICBpZiAoaXNGYWxzeSl7XG4gICAgICBzZXR0ZXIodHlwZW9mIGRlZmF1bHRWYWwgPT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbCgpIDogZGVmYXVsdFZhbCk7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0Tm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkZWZhdWx0Tm93UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAuZGVmYXVsdE5vdygpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG4gICAgfVxuXG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHNldHRlcihuZXcgRGF0ZSgpKTtcbiAgICB9XG4gIH07XG59OyIsIlxudmFyIHJ4ID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1haWxCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZW1haWxDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJOb3QgYW4gZW1haWwgYWRkcmVzcy5cIjtcbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbXB0eUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbXB0eUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIGNsYXNzVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gICAgaWYgKGhlbHBlcnMuaXNTdHJpbmcodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICB2YXIgbnVtYmVyT2ZGaWVsZHMgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBudW1iZXJPZkZpZWxkcyArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bWJlck9mRmllbGRzID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBudW1iZXIgb2YgZmllbGRzIGlzOiBcIitudW1iZXJPZkZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gXCJUeXBlIGNhbm5vdCBiZSBlbXB0eTogXCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5kc1dpdGhCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbmRzV2l0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5sYXN0SW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIGlmICghaGFzSW5kZXhPZikge1xuICAgICAgcmV0dXJuIFwiRGF0YSBoYXMgbm8gbGFzdEluZGV4T2YsIHNvIHRoZXJlJ3Mgbm8gd2F5IHRvIGNoZWNrIGAuZW5kc1dpdGgoKWAuXCI7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHZhbC5sYXN0SW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICByZXR1cm4gXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUxlbmd0aCA9ICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHx8IDA7XG4gICAgdmFsdWVMZW5ndGggPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gdmFsdWVMZW5ndGggOiAxO1xuICAgIC8vb3V0c2lkZSB2YWx1ZSBpcyBhIHN0cmluZyBhbmQgaW5zaWRlIHZhbHVlIGlzIGFuIGVtcHR5IHN0cmluZz8gdGhhdCdzIGV2ZXJ5d2hlcmVcbiAgICBpZiAodmFsdWVMZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgdmFsaWQgPSBpbmRleCA9PT0gKHZhbC5sZW5ndGggLSB2YWx1ZUxlbmd0aCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiRGF0YSBjb250YWlucyB0aGUgdmFsdWUsIGJ1dCBkb2VzIG5vdCBlbmQgd2l0aCBpdC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlcXVhbEJ1aWxkZXIoZXhhbXBsZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBjb21wYXJpc29uIG9iamVjdCBnaXZlbiBpbiBpdHNhLmVxdWFsKC4uLilcIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBlcXVhbENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gZXhhbXBsZSA9PT0gdmFsO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRpZCBub3QgcGFzcyBlcXVhbGl0eSB0ZXN0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhbHNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZhbHNlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSBmYWxzZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgZmFsc2VgLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc3lCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc3lDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiAhdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGZhbHN5LlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZ1bmN0aW9uQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZ1bmN0aW9uQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzRnVuY3Rpb24odmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvbi5cIjtcbiAgfTtcbn07XG4iLCJcbnZhciByeCA9IC9eWzAtOWEtZl0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhleEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoZXhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgaGV4LCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGhleC5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWxwaGFudW1lcmljXCI6IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljJyksXG4gIFwiYW55XCI6IHJlcXVpcmUoJy4vYW55JyksXG4gIFwiYXJnc1wiOiByZXF1aXJlKCcuL2FyZ3MnKSxcbiAgXCJhcnJheVwiOiByZXF1aXJlKCcuL2FycmF5JyksXG4gIFwiYXJyYXlPZlwiOiByZXF1aXJlKCcuL2FycmF5T2YnKSxcbiAgXCJiZXR3ZWVuXCI6IHJlcXVpcmUoJy4vYmV0d2VlbicpLFxuICBcImJvb2xlYW5cIjogcmVxdWlyZSgnLi9ib29sZWFuJyksXG4gIFwiY3VzdG9tXCI6IHJlcXVpcmUoJy4vY3VzdG9tJyksXG4gIFwiY29udGFpbnNcIjogcmVxdWlyZSgnLi9jb250YWlucycpLFxuICBcImRhdGVcIjogcmVxdWlyZSgnLi9kYXRlJyksXG4gIFwiZGVmYXVsdFwiOiByZXF1aXJlKCcuL2RlZmF1bHQnKSxcbiAgXCJkZWZhdWx0Tm93XCI6IHJlcXVpcmUoJy4vZGVmYXVsdE5vdycpLFxuICBcImVtYWlsXCI6IHJlcXVpcmUoJy4vZW1haWwnKSxcbiAgXCJlbXB0eVwiOiByZXF1aXJlKCcuL2VtcHR5JyksXG4gIFwiZW5kc1dpdGhcIjogcmVxdWlyZSgnLi9lbmRzV2l0aCcpLFxuICBcImVxdWFsXCI6IHJlcXVpcmUoJy4vZXF1YWwnKSxcbiAgXCJmYWxzZVwiOiByZXF1aXJlKCcuL2ZhbHNlJyksXG4gIFwiZmFsc3lcIjogcmVxdWlyZSgnLi9mYWxzeScpLFxuICBcImZ1bmN0aW9uXCI6IHJlcXVpcmUoJy4vZnVuY3Rpb24nKSxcbiAgXCJoZXhcIjogcmVxdWlyZSgnLi9oZXgnKSxcbiAgXCJpbnRlZ2VyXCI6IHJlcXVpcmUoJy4vaW50ZWdlcicpLFxuICBcImpzb25cIjogcmVxdWlyZSgnLi9qc29uJyksXG4gIFwibGVuXCI6IHJlcXVpcmUoJy4vbGVuJyksXG4gIFwibG93ZXJjYXNlXCI6IHJlcXVpcmUoJy4vbG93ZXJjYXNlJyksXG4gIFwibWF0Y2hlc1wiOiByZXF1aXJlKCcuL21hdGNoZXMnKSxcbiAgXCJtYXhMZW5ndGhcIjogcmVxdWlyZSgnLi9tYXhMZW5ndGgnKSxcbiAgXCJtaW5MZW5ndGhcIjogcmVxdWlyZSgnLi9taW5MZW5ndGgnKSxcbiAgXCJuYW5cIjogcmVxdWlyZSgnLi9uYW4nKSxcbiAgXCJub3RFbXB0eVwiOiByZXF1aXJlKCcuL25vdEVtcHR5JyksXG4gIFwibnVsbFwiOiByZXF1aXJlKCcuL251bGwnKSxcbiAgXCJudW1iZXJcIjogcmVxdWlyZSgnLi9udW1iZXInKSxcbiAgXCJvYmplY3RcIjogcmVxdWlyZSgnLi9vYmplY3QnKSxcbiAgXCJvdmVyXCI6IHJlcXVpcmUoJy4vb3ZlcicpLFxuICBcInJlZ2V4cFwiOiByZXF1aXJlKCcuL3JlZ2V4cCcpLFxuICBcInN0YXJ0c1dpdGhcIjogcmVxdWlyZSgnLi9zdGFydHNXaXRoJyksXG4gIFwic3RyaW5nXCI6IHJlcXVpcmUoJy4vc3RyaW5nJyksXG4gIFwidG9cIjogcmVxdWlyZSgnLi90bycpLFxuICBcInRvRGF0ZVwiOiByZXF1aXJlKCcuL3RvRGF0ZScpLFxuICBcInRvRmxvYXRcIjogcmVxdWlyZSgnLi90b0Zsb2F0JyksXG4gIFwidG9JbnRlZ2VyXCI6IHJlcXVpcmUoJy4vdG9JbnRlZ2VyJyksXG4gIFwidG9Mb3dlcmNhc2VcIjogcmVxdWlyZSgnLi90b0xvd2VyY2FzZScpLFxuICBcInRvTm93XCI6IHJlcXVpcmUoJy4vdG9Ob3cnKSxcbiAgXCJ0b1N0cmluZ1wiOiByZXF1aXJlKCcuL3RvU3RyaW5nJyksXG4gIFwidG9UcmltbWVkXCI6IHJlcXVpcmUoJy4vdG9UcmltbWVkJyksXG4gIFwidG9VcHBlcmNhc2VcIjogcmVxdWlyZSgnLi90b1VwcGVyY2FzZScpLFxuICBcInRydWVcIjogcmVxdWlyZSgnLi90cnVlJyksXG4gIFwidHJ1dGh5XCI6IHJlcXVpcmUoJy4vdHJ1dGh5JyksXG4gIFwidHlwZW9mXCI6IHJlcXVpcmUoJy4vdHlwZW9mJyksXG4gIFwidW5kZWZpbmVkXCI6IHJlcXVpcmUoJy4vdW5kZWZpbmVkJyksXG4gIFwidW5kZXJcIjogcmVxdWlyZSgnLi91bmRlcicpLFxuICBcInVuaXF1ZVwiOiByZXF1aXJlKCcuL3VuaXF1ZScpLFxuICBcInVwcGVyY2FzZVwiOiByZXF1aXJlKCcuL3VwcGVyY2FzZScpXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW50ZWdlckJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpbnRlZ2VyQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiXG4gICAgICAgICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlXG4gICAgICAgICYmIFtOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWV0uaW5kZXhPZih2YWwpID09PSAtMVxuICAgICAgICAmJiB2YWwgJSAxID09PSAwO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgaW50ZWdlclwiO1xuICB9O1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBqc29uQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGpzb25DaGVja2VyKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gXCJKU09OIG11c3QgYmUgYSBzdHJpbmcuXCI7XG4gICAgfVxuXG4gICAgdHJ5e1xuICAgICAgSlNPTi5wYXJzZSh2YWwpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgcmV0dXJuIFwiVmFsdWUgaXMgYSBub3QgdmFsaWQgSlNPTiBzdHJpbmcuXCI7XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGVuQnVpbGRlcihleGFjdE9yTWluLCBtYXgpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgdmFyIHZhbGlkYXRpb25UeXBlID0gXCJ0cnV0aHlcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB2YWxpZGF0aW9uVHlwZSA9IFwiZXhhY3RcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB2YWxpZGF0aW9uVHlwZSA9IFwiYmV0d2VlblwiO1xuXG4gIHJldHVybiBmdW5jdGlvbiBsZW5DaGVja2VyKHZhbCkge1xuICAgIHZhciBsZW5ndGggPSAodmFsIHx8ICh0eXBlb2YgdmFsKSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJ0cnV0aHlcIil7XG4gICAgICByZXR1cm4gbGVuZ3RoID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCB0cnV0aHkuXCI7XG4gICAgfWVsc2UgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcImV4YWN0XCIpe1xuICAgICAgcmV0dXJuIGxlbmd0aCA9PT0gZXhhY3RPck1pbiA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgZXhhY3RseTogXCIrZXhhY3RPck1pbjtcbiAgICB9ZWxzZSBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwiYmV0d2VlblwiKXtcbiAgICAgIHZhciB2YWxpZCA9IGxlbmd0aCA+PSBleGFjdE9yTWluICYmIGxlbmd0aCA8PSBtYXg7XG4gICAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJMZW5ndGggaXMgbm90IGJldHdlZW4gXCIrZXhhY3RPck1pbiArXCIgYW5kIFwiICsgbWF4O1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciByeCA9IC9bQS1aXS87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbG93ZXJjYXNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGxvd2VyY2FzZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIGNvbnRhaW5zIHVwcGVyY2FzZSBjaGFyYWN0ZXJzLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWF0Y2hlc0J1aWxkZXIocngpIHtcbiAgaWYgKHJ4IGluc3RhbmNlb2YgUmVnRXhwID09PSBmYWxzZSkge1xuICAgIHRocm93IFwiYC5tYXRjaGVzKC4uLilgIHJlcXVpcmVzIGEgcmVnZXhwXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gbWF0Y2hlc0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRvZXMgbm90IG1hdGNoIHJlZ2V4cC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWF4KSB7XG4gIGlmICh0eXBlb2YgbWF4ICE9IFwibnVtYmVyXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgbWF4aW11bSBpbiBtYXhMZW5ndGg6IFwiK21heDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPD0gbWF4O1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJtYXhMZW5ndGhcIiwgXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtYXggaXMgXCIrbWF4LCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWluTGVuZ3RoQnVpbGRlcihtaW4pIHtcbiAgaWYgKHR5cGVvZiBtaW4gIT0gXCJudW1iZXJcIikge1xuICAgIHRocm93IFwiSW52YWxpZCBtaW5pbXVtIGluIG1pbkxlbmd0aDogXCIrbWluO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBtaW5MZW5ndGhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPj0gbWluO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtaW5pbXVtIGlzIFwiK21pbik7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbmFuQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5hbkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGlzTmFOKHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgTmFOLlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vdEVtcHR5QnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5vdEVtcHR5Q2hlY2tlcih2YWwpIHtcblxuICAgIGlmIChoZWxwZXJzLmlzU3RyaW5nKHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoICE9PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgbm90IGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggIT09IDAgPyBudWxsIDogXCJDYW5ub3QgYmUgZW1wdHkuXCI7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICB2YXIgbnVtYmVyT2ZGaWVsZHMgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBudW1iZXJPZkZpZWxkcyArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bWJlck9mRmllbGRzICE9PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgbm90IGVtcHR5LCBidXQgbnVtYmVyIG9mIGZpZWxkcyBpczogXCIrbnVtYmVyT2ZGaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwiVHlwZSBjYW5ub3QgYmUgbm90LWVtcHR5OiBcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudWxsQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG51bGxDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IG51bGwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgbnVsbC5cIjtcbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudW1iZXJCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbnVtYmVyQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzVmFsaWROdW1iZXIodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIG51bWJlclwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGFtcGxlLCBhbGxvd0V4dHJhRmllbGRzKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGFsbG93RXh0cmFGaWVsZHMgPSBhbGxvd0V4dHJhRmllbGRzIHx8IGFyZ3MubGVuZ3RoID09PSAwO1xuXG4gIC8qXG4gICAqIFRoZSBleGFtcGxlIGlzIGFuIG9iamVjdCB3aGVyZSB0aGUga2V5cyBhcmUgdGhlIGZpZWxkIG5hbWVzXG4gICAqIGFuZCB0aGUgdmFsdWVzIGFyZSBpdHNhIGluc3RhbmNlcy5cbiAgICogQXNzaWduIHBhcmVudCBpbnN0YW5jZSBhbmQga2V5XG4gICAqL1xuICBmb3IodmFyIGtleSBpbiBleGFtcGxlKSB7XG4gICAgaWYgKCFleGFtcGxlLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZVtrZXldKTtcbiAgICBleGFtcGxlW2tleV0gPSBpdHNhSW5zdGFuY2U7XG4gICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0ga2V5O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgLy8gdHlwZW9mIFtdLCBudWxsLCBldGMgYXJlIG9iamVjdCwgc28gdXNlIHRoaXMgY2hlY2sgZm9yIGFjdHVhbCBvYmplY3RzXG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc1BsYWluT2JqZWN0KHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcIm9iamVjdFwiLCBcIlR5cGUgd2FzOiBcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIC8vZXh0cmEgZmllbGRzIG5vdCBhbGxvd2VkP1xuICAgIGlmIChhbGxvd0V4dHJhRmllbGRzID09PSBmYWxzZSkge1xuICAgICAgdmFyIGludmFsaWRGaWVsZHMgPSBbXTtcbiAgICAgIGZvcih2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBpZiAoa2V5IGluIGV4YW1wbGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgaW52YWxpZEZpZWxkcy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbnZhbGlkRmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwib2JqZWN0XCIsIFwiVW5leHBlY3RlZCBmaWVsZHM6IFwiK2ludmFsaWRGaWVsZHMuam9pbigpLCBmYWxzZSldXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKHZhciBrZXkgaW4gZXhhbXBsZSkge1xuICAgICAgaWYgKCFleGFtcGxlLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gZXhhbXBsZVtrZXldO1xuICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtrZXldOyB9O1xuICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2tleV0gPSBuZXdWYWw7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG92ZXJCdWlsZGVyKG1pbiwgaW5jbHVzaXZlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBvdmVyQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAoaW5jbHVzaXZlKSB7XG4gICAgICByZXR1cm4gdmFsID49IG1pbiA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3Qgb3ZlciB0aGUgbWluaW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPiBtaW4gPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IG92ZXIgdGhlIG1pbmltdW0gKGV4Y2x1c2l2ZSkuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc1JlZ0V4cCh2YWwpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJyZWdleHBcIiwgdmFsaWQ/XCJSZWdFeHAgdmVyaWZpZWQuXCI6XCJFeHBlY3RlZCBhIFJlZ0V4cC5cIiwgdmFsaWQpXSxcbiAgICB9O1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0YXJ0c1dpdGhCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBzdGFydHNXaXRoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmluZGV4T2YpIHx8ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKTtcbiAgICBpZiAoIWhhc0luZGV4T2YpIHtcbiAgICAgIHJldHVybiBcIkRhdGEgaGFzIG5vIGluZGV4T2YsIHNvIHRoZXJlJ3Mgbm8gd2F5IHRvIGNoZWNrIGAuc3RhcnRzV2l0aCgpYC5cIjtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gdmFsLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpe1xuICAgICAgcmV0dXJuIFwiRGF0YSBkb2VzIG5vdCBjb250YWluIHRoZSB2YWx1ZS5cIjtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4ID09PSAwID8gbnVsbCA6IFwiRGF0YSBjb250YWlucyB0aGUgdmFsdWUsIGJ1dCBkb2VzIG5vdCBzdGFydCB3aXRoIGl0LlwiO1xuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc1N0cmluZyh2YWwpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJzdHJpbmdcIiwgdmFsaWQ/XCJTdHJpbmcgaWRlbnRpZmllZC5cIjpcIkV4cGVjdGVkIGEgc3RyaW5nLlwiLCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9CdWlsZGVyICh2YWx1ZU9yR2V0dGVyKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBkZWZhdWx0IHZhbHVlIHdhcyBnaXZlbiBpbiBgLnRvKC4uLilgLlwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHRvUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAudG8oLi4uKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIHNldHRlcih0eXBlb2YgdmFsdWVPckdldHRlciA9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZU9yR2V0dGVyKCkgOiB2YWx1ZU9yR2V0dGVyKTtcbiAgfTtcbn07IiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvRGF0ZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9EYXRlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9EYXRlKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIGlmICghdmFsKSB7XG4gICAgICByZXR1cm4gXCJVbndpbGxpbmcgdG8gcGFyc2UgZmFsc3kgdmFsdWVzLlwiO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIFwiVW53aWxsaW5nIHRvIGNyZWF0ZSBkYXRlIGZyb20gYXJyYXlzLlwiO1xuICAgIH1cblxuICAgIHZhciBkYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICBpZiAoaXNGaW5pdGUoZGF0ZSkpIHtcbiAgICAgIHNldHRlcihkYXRlKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBcIlVuYWJsZSB0byBwYXJzZSBkYXRlLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9GbG9hdEJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9GbG9hdFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvRmxvYXQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBmbG9hdC5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9JbnRlZ2VyQnVpbGRlciAocmFkaXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSW50ZWdlclJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvSW50ZWdlcigpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBwYXJzZUludCh2YWwsIHR5cGVvZiByYWRpeCA9PT0gXCJ1bmRlZmluZWRcIiA/IDEwIDogcmFkaXgpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBpbnRlZ2VyLlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Mb3dlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTG93ZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9Mb3dlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvTm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b05vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLnRvTm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU3RyaW5nQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1N0cmluZ1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvU3RyaW5nKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IFN0cmluZyh2YWwpO1xuICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9UcmltbWVkQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1RyaW1tZWRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1RyaW1tZWQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50cmltKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9VcHBlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVXBwZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9VcHBlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydWVCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1ZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdHJ1ZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgdHJ1ZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cnV0aHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1dGh5Q2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHRydXRoeS5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHR5cGVvZkJ1aWxkZXIodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgIT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IFwiSW52YWxpZCB0eXBlIGdpdmVuIHRvIGBpdHNhLnR5cGVvZiguLi4pYDogXCIrdHlwZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gdHlwZW9mQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSB0eXBlO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJFeHBlY3RlZCB0eXBlIFwiK3R5cGUrXCIsIGJ1dCB0eXBlIGlzIFwiKyh0eXBlb2YgdmFsKSk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZWZpbmVkQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuZGVmaW5lZENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHVuZGVmaW5lZC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZGVyQnVpbGRlcihtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gdW5kZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCB1bmRlciB0aGUgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IHVuZGVyIHRoZSBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5pcXVlQnVpbGRlcihnZXR0ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuaXF1ZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgaXNUeXBlVmFsaWQgPSBoZWxwZXJzLmlzQXJyYXkodmFsKSB8fCBoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSB8fCBoZWxwZXJzLmlzU3RyaW5nKHZhbCk7XG4gICAgaWYgKCFpc1R5cGVWYWxpZCkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNoZWNrIHVuaXF1ZW5lc3Mgb24gdGhpcyB0eXBlIG9mIGRhdGEuXCI7XG4gICAgfVxuXG4gICAgdmFyIGdldHRlclR5cGUgPSBcIlwiO1xuICAgIGlmICh0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIpIHsgZ2V0dGVyVHlwZSA9IFwiZnVuY3Rpb25cIjsgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBnZXR0ZXIgIT09IFwidW5kZWZpbmVkXCIpIHsgZ2V0dGVyVHlwZSA9IFwicGx1Y2tcIjsgfVxuXG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgdmFyIGl0ZW0gPSB2YWxba2V5XTtcbiAgICAgIGlmIChnZXR0ZXJUeXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaXRlbSA9IGdldHRlcihpdGVtKTtcbiAgICAgIH1cbiAgICAgIGlmIChnZXR0ZXJUeXBlID09PSBcInBsdWNrXCIpIHtcbiAgICAgICAgaXRlbSA9IGl0ZW1bZ2V0dGVyXTtcbiAgICAgIH1cbiAgICAgIHZhciBhbHJlYWR5Rm91bmQgPSBpdGVtcy5pbmRleE9mKGl0ZW0pID4gLTE7XG4gICAgICBpZiAoYWxyZWFkeUZvdW5kKSB7XG4gICAgICAgIHJldHVybiBcIkl0ZW1zIGFyZSBub3QgdW5pcXVlLlwiO1xuICAgICAgfVxuICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59O1xuXG4iLCJcbnZhciByeCA9IC9bYS16XS87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXBwZXJjYXNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwcGVyY2FzZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIGNvbnRhaW5zIGxvd2VyY2FzZSBjaGFyYWN0ZXJzLlwiO1xuICB9O1xufTtcblxuIl19
