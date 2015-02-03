/*! 
  * @license 
  * itsa 1.2.11 <https://github.com/bendytree/node-itsa> 
  * Copyright 2/02/2015 Josh Wright <http://www.joshwright.com> 
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
itsa.prototype.validOrThrow = require("./methods/validOrThrow");
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

},{"./aliases":2,"./methods/_validate":5,"./methods/alias":6,"./methods/build-final-result":7,"./methods/build-log":8,"./methods/combine-results":9,"./methods/convert-validator-to-itsa-instance":10,"./methods/extend":11,"./methods/msg":12,"./methods/validOrThrow":13,"./methods/validate":14,"./validators":35}],5:[function(require,module,exports){

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
    console.trace();
    console.error(e);
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

},{"./alphanumeric":15,"./any":16,"./args":17,"./array":18,"./arrayOf":19,"./between":20,"./boolean":21,"./contains":22,"./custom":23,"./date":24,"./default":25,"./defaultNow":26,"./email":27,"./empty":28,"./endsWith":29,"./equal":30,"./false":31,"./falsy":32,"./function":33,"./hex":34,"./instanceof":36,"./integer":37,"./json":38,"./len":39,"./lowercase":40,"./matches":41,"./maxLength":42,"./minLength":43,"./nan":44,"./notEmpty":45,"./null":46,"./number":47,"./object":48,"./over":49,"./regexp":50,"./startsWith":51,"./string":52,"./to":53,"./toDate":54,"./toFloat":55,"./toInteger":56,"./toLowercase":57,"./toNow":58,"./toString":59,"./toTrimmed":60,"./toUppercase":61,"./true":62,"./truthy":63,"./typeof":64,"./undefined":65,"./under":66,"./unique":67,"./uppercase":68}],36:[function(require,module,exports){


module.exports = function instanceofBuilder(type) {
  if (typeof type != "function") {
    throw "Invalid type given to `itsa.instanceof(...)`: "+type;
  }
  return function instanceofChecker(val) {
    var valid = Object.getPrototypeOf(val) === type.prototype;
    return valid ? null : "instanceof check failed.";
  };
};

},{}],37:[function(require,module,exports){


module.exports = function integerBuilder() {
  return function integerChecker(val) {
    var valid = typeof val === "number"
        && isNaN(val) === false
        && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
        && val % 1 === 0;
    return valid ? null : "Invalid integer";
  };
};

},{}],38:[function(require,module,exports){

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


},{}],39:[function(require,module,exports){


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

},{}],40:[function(require,module,exports){

var rx = /[A-Z]/;

module.exports = function lowercaseBuilder() {
  return function lowercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains uppercase characters.";
  };
};


},{}],41:[function(require,module,exports){


module.exports = function matchesBuilder(rx) {
  if (rx instanceof RegExp === false) {
    throw "`.matches(...)` requires a regexp";
  }

  return function matchesChecker(val) {
    var valid = rx.test(val);
    return valid ? null : "Value does not match regexp.";
  };
};

},{}],42:[function(require,module,exports){


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

},{}],43:[function(require,module,exports){


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

},{}],44:[function(require,module,exports){


module.exports = function nanBuilder() {
  return function nanChecker(val) {
    return isNaN(val) ? null : "Value is not NaN.";
  };
};


},{}],45:[function(require,module,exports){

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

},{"../helpers":3}],46:[function(require,module,exports){


module.exports = function nullBuilder() {
  return function nullChecker(val) {
    return val === null ? null : "Value is not null.";
  };
};


},{}],47:[function(require,module,exports){

var helpers = require("../helpers");

module.exports = function numberBuilder() {
  return function numberChecker(val) {
    var valid = helpers.isValidNumber(val);
    return valid ? null : "Invalid number";
  };
};


},{"../helpers":3}],48:[function(require,module,exports){

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

},{"../helpers":3}],49:[function(require,module,exports){


module.exports = function overBuilder(min, inclusive) {
  return function overChecker(val) {
    if (inclusive) {
      return val >= min ? null : "Value was not over the minimum (inclusive).";
    }else{
      return val > min ? null : "Value was not over the minimum (exclusive).";
    }
  };
};

},{}],50:[function(require,module,exports){

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

},{"../helpers":3}],51:[function(require,module,exports){


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

},{}],52:[function(require,module,exports){

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

},{"../helpers":3}],53:[function(require,module,exports){


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
},{}],54:[function(require,module,exports){

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

},{"../helpers":3}],55:[function(require,module,exports){

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

},{}],56:[function(require,module,exports){


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
},{}],57:[function(require,module,exports){


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
},{}],58:[function(require,module,exports){


module.exports = function toNowBuilder () {
  return function toNowRunner (val, setter) {
    if (!setter) {
      throw "`.toNow()` may not be used unless it is within an object or array.";
    }

    setter(new Date());
  };
};
},{}],59:[function(require,module,exports){


module.exports = function toStringBuilder () {
  return function toStringRunner (val, setter) {
    if (!setter) throw "`.toString()` may not be used unless it is within an object or array.";

    var newValue = String(val);
    if (val !== newValue) {
      setter(newValue);
    }
  };
};
},{}],60:[function(require,module,exports){


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
},{}],61:[function(require,module,exports){


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
},{}],62:[function(require,module,exports){


module.exports = function trueBuilder() {
  return function trueChecker(val) {
    return val === true ? null : "Value is not `true`.";
  };
};


},{}],63:[function(require,module,exports){


module.exports = function truthyBuilder() {
  return function truthyChecker(val) {
    return val ? null : "Value is not truthy.";
  };
};


},{}],64:[function(require,module,exports){


module.exports = function typeofBuilder(type) {
  if (typeof type != "string") {
    throw "Invalid type given to `itsa.typeof(...)`: "+type;
  }
  return function typeofChecker(val) {
    var valid = typeof val === type;
    return valid ? null : ("Expected type "+type+", but type is "+(typeof val));
  };
};

},{}],65:[function(require,module,exports){


module.exports = function undefinedBuilder() {
  return function undefinedChecker(val) {
    return val === undefined ? null : "Value is not undefined.";
  };
};


},{}],66:[function(require,module,exports){


module.exports = function underBuilder(max, inclusive) {
  return function underChecker(val) {
    if (inclusive) {
      return val <= max ? null : "Value was not under the maximum (inclusive).";
    }else{
      return val < max ? null : "Value was not under the maximum (exclusive).";
    }
  };
};

},{}],67:[function(require,module,exports){

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


},{"../helpers":3}],68:[function(require,module,exports){

var rx = /[a-z]/;

module.exports = function uppercaseBuilder() {
  return function uppercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains lowercase characters.";
  };
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2hlbHBlcnMuanMiLCJsaWIvaXRzYS5qcyIsImxpYi9tZXRob2RzL192YWxpZGF0ZS5qcyIsImxpYi9tZXRob2RzL2FsaWFzLmpzIiwibGliL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0LmpzIiwibGliL21ldGhvZHMvYnVpbGQtbG9nLmpzIiwibGliL21ldGhvZHMvY29tYmluZS1yZXN1bHRzLmpzIiwibGliL21ldGhvZHMvY29udmVydC12YWxpZGF0b3ItdG8taXRzYS1pbnN0YW5jZS5qcyIsImxpYi9tZXRob2RzL2V4dGVuZC5qcyIsImxpYi9tZXRob2RzL21zZy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkT3JUaHJvdy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvYWxwaGFudW1lcmljLmpzIiwibGliL3ZhbGlkYXRvcnMvYW55LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJncy5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9mdW5jdGlvbi5qcyIsImxpYi92YWxpZGF0b3JzL2hleC5qcyIsImxpYi92YWxpZGF0b3JzL2luZGV4LmpzIiwibGliL3ZhbGlkYXRvcnMvaW5zdGFuY2VvZi5qcyIsImxpYi92YWxpZGF0b3JzL2ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9qc29uLmpzIiwibGliL3ZhbGlkYXRvcnMvbGVuLmpzIiwibGliL3ZhbGlkYXRvcnMvbG93ZXJjYXNlLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF0Y2hlcy5qcyIsImxpYi92YWxpZGF0b3JzL21heExlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL21pbkxlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL25hbi5qcyIsImxpYi92YWxpZGF0b3JzL25vdEVtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvbnVsbC5qcyIsImxpYi92YWxpZGF0b3JzL251bWJlci5qcyIsImxpYi92YWxpZGF0b3JzL29iamVjdC5qcyIsImxpYi92YWxpZGF0b3JzL292ZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9yZWdleHAuanMiLCJsaWIvdmFsaWRhdG9ycy9zdGFydHNXaXRoLmpzIiwibGliL3ZhbGlkYXRvcnMvc3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG8uanMiLCJsaWIvdmFsaWRhdG9ycy90b0RhdGUuanMiLCJsaWIvdmFsaWRhdG9ycy90b0Zsb2F0LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9JbnRlZ2VyLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9Mb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90b05vdy5qcyIsImxpYi92YWxpZGF0b3JzL3RvU3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9UcmltbWVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9VcHBlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90cnVlLmpzIiwibGliL3ZhbGlkYXRvcnMvdHJ1dGh5LmpzIiwibGliL3ZhbGlkYXRvcnMvdHlwZW9mLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZWZpbmVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZXIuanMiLCJsaWIvdmFsaWRhdG9ycy91bmlxdWUuanMiLCJsaWIvdmFsaWRhdG9ycy91cHBlcmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2l0c2FcIik7XG4iLCJcbi8qKlxuICogQSBsaXN0IG9mIGJ1aWx0IGluIGFsaWFzZXMgZm9yIGl0c2EgdmFsaWRhdG9ycy5cbiAqXG4gKiB7IFwiYWxpYXNOYW1lXCIgOiBcInJlYWxOYW1lXCIgfVxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJhZnRlclwiOiBcIm92ZXJcIixcbiAgXCJiZWZvcmVcIjogXCJ1bmRlclwiXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzQm9vbGVhbjogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IEJvb2xlYW5dXCI7XG4gIH0sXG5cbiAgaXNWYWxpZERhdGU6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBEYXRlXVwiICYmIGlzRmluaXRlKHZhbCk7XG4gIH0sXG5cbiAgaXNSZWdFeHA6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBSZWdFeHBdXCI7XG4gIH0sXG5cbiAgaXNGdW5jdGlvbjogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiO1xuICB9LFxuXG4gIGlzQXJyYXk6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgfSxcblxuICBpc1BsYWluT2JqZWN0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xuICB9LFxuXG4gIGlzU3RyaW5nOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgU3RyaW5nXVwiO1xuICB9LFxuXG4gIGlzVmFsaWROdW1iZXI6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIlxuICAgICAgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2VcbiAgICAgICYmIFtOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWV0uaW5kZXhPZih2YWwpID09PSAtMTtcbiAgfSxcblxuICBpc0FyZ3VtZW50czogZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vZm9yIE9wZXJhXG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgKCBcImNhbGxlZVwiIGluIHZhbCApICYmIHR5cGVvZiB2YWwubGVuZ3RoID09PSBcIm51bWJlclwiO1xuICB9XG5cbn07XG4iLCJcbnZhciBpdHNhID0gZnVuY3Rpb24gKCkge1xuICAvL2ZvcmNlIGBuZXdgXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBpdHNhKSkgeyByZXR1cm4gbmV3IGl0c2EoKTsgfVxuXG4gIHRoaXMudmFsaWRhdG9ycyA9IFtdO1xuICB0aGlzLmVycm9yTWVzc2FnZXMgPSB7fTtcbn07XG5cbi8vIFByaXZhdGVcbml0c2EucHJvdG90eXBlLl9idWlsZExvZyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYnVpbGQtbG9nXCIpO1xuaXRzYS5wcm90b3R5cGUuX2J1aWxkRmluYWxSZXN1bHQgPSByZXF1aXJlKFwiLi9tZXRob2RzL2J1aWxkLWZpbmFsLXJlc3VsdFwiKTtcbml0c2EucHJvdG90eXBlLl9jb21iaW5lUmVzdWx0cyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvY29tYmluZS1yZXN1bHRzXCIpO1xuaXRzYS5wcm90b3R5cGUuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZSA9IHJlcXVpcmUoXCIuL21ldGhvZHMvY29udmVydC12YWxpZGF0b3ItdG8taXRzYS1pbnN0YW5jZVwiKTtcbml0c2EucHJvdG90eXBlLl92YWxpZGF0ZSA9IHJlcXVpcmUoXCIuL21ldGhvZHMvX3ZhbGlkYXRlXCIpO1xuaXRzYS5wcm90b3R5cGUuX2l0c2EgPSBpdHNhO1xuXG4vLyBQdWJsaWNcbml0c2EucHJvdG90eXBlLnZhbGlkYXRlID0gcmVxdWlyZShcIi4vbWV0aG9kcy92YWxpZGF0ZVwiKTtcbml0c2EucHJvdG90eXBlLnZhbGlkT3JUaHJvdyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvdmFsaWRPclRocm93XCIpO1xuaXRzYS5wcm90b3R5cGUubXNnID0gcmVxdWlyZShcIi4vbWV0aG9kcy9tc2dcIik7XG5pdHNhLmV4dGVuZCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvZXh0ZW5kXCIpO1xuaXRzYS5hbGlhcyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYWxpYXNcIik7XG5cbi8vIEJ1aWx0IGluIHZhbGlkYXRvcnNcbml0c2EuZXh0ZW5kKHJlcXVpcmUoXCIuL3ZhbGlkYXRvcnNcIikpO1xuXG4vLyBBZGQgYWxpYXNlc1xudmFyIGFsaWFzZXMgPSByZXF1aXJlKFwiLi9hbGlhc2VzXCIpO1xuZm9yICh2YXIga2V5IGluIGFsaWFzZXMpe1xuICBpdHNhLmFsaWFzKGFsaWFzZXNba2V5XSwga2V5KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0c2E7XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX3ZhbGlkYXRlKGdldHRlciwgc2V0dGVyKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGZvciAodmFyIGkgaW4gdGhpcy52YWxpZGF0b3JzKSB7XG4gICAgaWYgKCF0aGlzLnZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgdmFyIHZhbGlkYXRvciA9IHRoaXMudmFsaWRhdG9yc1tpXTtcblxuICAgIC8vZ2V0IHJlc3VsdFxuICAgIHZhciByZXN1bHQgPSBydW5WYWxpZGF0b3IodGhpcywgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcik7XG5cbiAgICAvL2ludGVycHJldCByZXN1bHRcbiAgICByZXN1bHQgPSBpbnRlcnByZXRSZXN1bHQodGhpcywgcmVzdWx0KTtcblxuICAgIC8vY3VzdG9tIGVycm9yXG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UgJiYgdGhpcy5lcnJvck1lc3NhZ2VzW3ZhbGlkYXRvcl0pe1xuICAgICAgcmVzdWx0LmxvZ3NbMF0uY3VzdG9tTWVzc2FnZSA9IHRoaXMuZXJyb3JNZXNzYWdlc1t2YWxpZGF0b3JdO1xuICAgIH1cblxuICAgIC8vYWRkIGl0IHRvIGxpc3Qgb2YgcmVzdWx0c1xuICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuXG4gICAgLy9pbnZhbGlkPyBzaG9ydCBjaXJjdWl0XG4gICAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UpIHsgYnJlYWs7IH1cbiAgfVxuICByZXR1cm4gdGhpcy5fYnVpbGRGaW5hbFJlc3VsdCh0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKSk7XG59O1xuXG52YXIgcnVuVmFsaWRhdG9yID0gZnVuY3Rpb24gKGl0c2FJbnN0YW5jZSwgdmFsaWRhdG9yLCBnZXR0ZXIsIHNldHRlcikge1xuICB0cnl7XG4gICAgLy9hbHJlYWR5IGFuIGl0c2EgaW5zdGFuY2U/IGp1c3QgcnVuIHZhbGlkYXRlXG4gICAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwib2JqZWN0XCIgJiYgdmFsaWRhdG9yIGluc3RhbmNlb2YgaXRzYUluc3RhbmNlLl9pdHNhKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdG9yLnZhbGlkYXRlKGdldHRlciwgc2V0dGVyKTtcbiAgICB9XG5cbiAgICAvL3RpbWUgdG8gZ2V0IHRoZSByZWFsIHZhbHVlIChjb3VsZCBiZSBhIHZhbHVlIG9yIGEgZnVuY3Rpb24pXG4gICAgdmFyIHZhbCA9IHR5cGVvZiBnZXR0ZXIgPT09IFwiZnVuY3Rpb25cIiA/IGdldHRlcigpIDogZ2V0dGVyO1xuXG4gICAgLy9hIGZ1bmN0aW9uP1xuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgLy90cnkgYSBjbGFzcyB0eXBlIGNoZWNrXG4gICAgICB2YXIgY2xhc3NUeXBlUmVzdWx0ID0gcnVuQ2xhc3NUeXBlVmFsaWRhdG9yKHZhbGlkYXRvciwgdmFsKTtcbiAgICAgIGlmIChjbGFzc1R5cGVSZXN1bHQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiBjbGFzc1R5cGVSZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIC8vcnVuIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSB2YWx1ZVxuICAgICAgcmV0dXJuIHZhbGlkYXRvci5jYWxsKGl0c2FJbnN0YW5jZSwgdmFsLCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIC8vc29tZXRoaW5nIGVsc2UsIHNvIHRoaXMgaXMgYSA9PT0gY2hlY2tcbiAgICByZXR1cm4gdmFsID09PSB2YWxpZGF0b3I7XG4gIH1jYXRjaChlKXtcbiAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgICByZXR1cm4gXCJVbmhhbmRsZWQgZXJyb3IuIFwiK1N0cmluZyhlKTtcbiAgfVxufTtcblxudmFyIGludGVycHJldFJlc3VsdCA9IGZ1bmN0aW9uIChpdHNhSW5zdGFuY2UsIHJlc3VsdCkge1xuICAvL3Jlc3VsdCBpcyBhIGJvb2xlYW4/XG4gIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcImJvb2xlYW5cIikge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogcmVzdWx0LFxuICAgICAgbG9nczogW2l0c2FJbnN0YW5jZS5fYnVpbGRMb2coXCJmdW5jdGlvblwiLCByZXN1bHQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOlwiVmFsaWRhdGlvbiBmYWlsZWRcIiwgcmVzdWx0KV1cbiAgICB9O1xuICB9XG5cbiAgLy9yZXN1bHQgaXMgYW4gb2JqZWN0P1xuICBpZiAoaGVscGVycy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy9vdGhlcndpc2UgaW50ZXJwcmV0IGl0IGFzIHN0cmluZz1lcnJvclxuICB2YXIgdmFsaWQgPSB0eXBlb2YgcmVzdWx0ICE9PSBcInN0cmluZ1wiIHx8ICFyZXN1bHQ7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbGlkLFxuICAgIGxvZ3M6IFtpdHNhSW5zdGFuY2UuX2J1aWxkTG9nKFwiZnVuY3Rpb25cIiwgdmFsaWQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOnJlc3VsdCwgdmFsaWQpXVxuICB9O1xufTtcblxudmFyIHJ1bkNsYXNzVHlwZVZhbGlkYXRvciA9IGZ1bmN0aW9uKGNscywgdmFsKSB7XG4gIHZhciBjbGFzc01hcHMgPSBbXG4gICAgeyBjbHM6IEJvb2xlYW4sIHZhbGlkYXRvcjogaGVscGVycy5pc0Jvb2xlYW4gfSxcbiAgICB7IGNsczogU3RyaW5nLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNTdHJpbmcgfSxcbiAgICB7IGNsczogTnVtYmVyLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNWYWxpZE51bWJlciB9LFxuICAgIHsgY2xzOiBPYmplY3QsIHZhbGlkYXRvcjogaGVscGVycy5pc1BsYWluT2JqZWN0IH0sXG4gICAgeyBjbHM6IERhdGUsIHZhbGlkYXRvcjogaGVscGVycy5pc1ZhbGlkRGF0ZSB9LFxuICAgIHsgY2xzOiBBcnJheSwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzQXJyYXkgfSxcbiAgICB7IGNsczogUmVnRXhwLCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNSZWdFeHAgfSxcbiAgICB7IGNsczogRnVuY3Rpb24sIHZhbGlkYXRvcjogaGVscGVycy5pc0Z1bmN0aW9uIH1cbiAgXTtcbiAgZm9yICh2YXIgaSBpbiBjbGFzc01hcHMpIHtcbiAgICBpZiAoIWNsYXNzTWFwcy5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICB2YXIgY2xhc3NNYXAgPSBjbGFzc01hcHNbaV07XG4gICAgaWYgKGNscyA9PT0gY2xhc3NNYXAuY2xzKSB7XG4gICAgICByZXR1cm4gY2xhc3NNYXAudmFsaWRhdG9yKHZhbCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuIiwiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbGlhcyhvbGROYW1lLCBuZXdOYW1lKSB7XG4gIHRoaXNbbmV3TmFtZV0gPSB0aGlzLnByb3RvdHlwZVtuZXdOYW1lXSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXNbb2xkTmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufTtcbiIsIlxudmFyIEZpbmFsUmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICB0aGlzLnZhbGlkID0gcmVzdWx0LnZhbGlkO1xuICB0aGlzLmxvZ3MgPSByZXN1bHQubG9ncztcbn07XG5cbkZpbmFsUmVzdWx0LnByb3RvdHlwZS5kZXNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy92YWxpZD8gY29vbCBzdG9yeSBicm9cbiAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICByZXR1cm4gXCJWYWxpZGF0aW9uIHN1Y2NlZWRlZC5cIjtcbiAgfVxuXG4gIC8vaW52YWxpZFxuICB2YXIgbWVzc2FnZXMgPSBbXTtcbiAgZm9yICh2YXIgaSBpbiB0aGlzLmxvZ3Mpe1xuICAgIHZhciBsb2cgPSB0aGlzLmxvZ3NbaV07XG4gICAgaWYgKGxvZy52YWxpZCkgY29udGludWU7XG4gICAgaWYgKGxvZy5jdXN0b21NZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKGxvZy5jdXN0b21NZXNzYWdlKTtcbiAgICB9ZWxzZXtcbiAgICAgIG1lc3NhZ2VzLnB1c2goKGxvZy5wYXRoID8gKGxvZy5wYXRoICsgXCI6IFwiKSA6IFwiXCIpICsgbG9nLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlcy5qb2luKFwiXFxuXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHJldHVybiBuZXcgRmluYWxSZXN1bHQocmVzdWx0KTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yLCBtc2csIHZhbGlkKSB7XG4gIHZhciBwYXRocyA9IFtdO1xuICB2YXIgbm9kZSA9IHRoaXM7XG4gIHdoaWxlIChub2RlICYmIG5vZGUuX2tleSkge1xuICAgIHBhdGhzLnNwbGljZSgwLCAwLCBub2RlLl9rZXkpO1xuICAgIG5vZGUgPSBub2RlLl9wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgcGF0aDogcGF0aHMuam9pbihcIi5cIiksXG4gICAgdmFsaWRhdG9yOiB2YWxpZGF0b3IsXG4gICAgbWVzc2FnZTogbXNnLFxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gIC8vb25lIHJlc3VsdD8gc2hvcnRjdXRcbiAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gIH1cblxuICB2YXIgdmFsaWQgPSB0cnVlO1xuICB2YXIgbG9ncyA9IFtdO1xuXG4gIGZvciAodmFyIGkgaW4gcmVzdWx0cykge1xuICAgIGlmICghcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICB2YXIgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICB2YWxpZCA9IHZhbGlkICYmIHJlc3VsdC52YWxpZDtcblxuICAgIGlmIChyZXN1bHQubG9ncyAmJiByZXN1bHQubG9ncy5sZW5ndGgpIHtcbiAgICAgIGxvZ3MucHVzaC5hcHBseShsb2dzLCByZXN1bHQubG9ncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHZhbGlkLCBsb2dzOiBsb2dzIH07XG59OyIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yKSB7XG4gIC8vYWxyZWFkeSBhbiBgaXRzYWAgaW5zdGFuY2U/XG4gIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcIm9iamVjdFwiICYmIHZhbGlkYXRvciBpbnN0YW5jZW9mIHRoaXMuX2l0c2EpIHtcbiAgICByZXR1cm4gdmFsaWRhdG9yO1xuICB9XG5cbiAgLy9ub3QgYW4gaW5zdGFuY2UgeWV0LCBzbyBjcmVhdGUgb25lXG4gIHZhciBpbnN0YW5jZSA9IG5ldyB0aGlzLl9pdHNhKCk7XG4gIGluc3RhbmNlLnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICByZXR1cm4gaW5zdGFuY2U7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZChleHRlbnNpb25zKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gZXh0ZW5zaW9ucykge1xuICAgIC8vaWdub3JlIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gICAgaWYgKCFleHRlbnNpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICBhc3NpZ24odGhpcywgbmFtZSwgZXh0ZW5zaW9uc1tuYW1lXSk7XG4gIH1cbn07XG5cbnZhciBhc3NpZ24gPSBmdW5jdGlvbiAoaXRzYSwgbmFtZSwgYnVpbGRlcikge1xuXG4gIC8qKlxuICAgKiBBbGxvd3Mgc3RhdGljIGFjY2VzcyAtIGxpa2UgYGl0c2Euc3RyaW5nKClgXG4gICAqL1xuICBpdHNhW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBpdHNhKCk7XG4gICAgaW5zdGFuY2UudmFsaWRhdG9ycyA9IFtidWlsZGVyLmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpXTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFsbG93cyBjaGFpbmluZyAtIGxpa2UgYGl0c2Euc29tZXRoaW5nKCkuc3RyaW5nKClgXG4gICAqL1xuICBpdHNhLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbGlkYXRvcnMucHVzaChidWlsZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbXNnKG1zZykge1xuICBpZiAodHlwZW9mIG1zZyAhPT0gXCJzdHJpbmdcIiB8fCAhbXNnKSB7XG4gICAgdGhyb3cgXCIubXNnKC4uLikgbXVzdCBiZSBnaXZlbiBhbiBlcnJvciBtZXNzYWdlXCI7XG4gIH1cblxuICB0aGlzLmVycm9yTWVzc2FnZXNbdGhpcy52YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9ycy5sZW5ndGgtMV1dID0gbXNnO1xuXG4gIHJldHVybiB0aGlzO1xufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRPclRocm93KHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLnZhbGlkYXRlKHZhbHVlKTtcbiAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyByZXN1bHQuZGVzY3JpYmUoKTtcbiAgfVxufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRhdGUodmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlKGZ1bmN0aW9uIHZhbHVlR2V0dGVyKCl7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG4iLCJcbnZhciByeCA9IC9eWzAtOWEtel0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFscGhhbnVtZXJpY0J1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhbHBoYW51bWVyaWNDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgYWxwaGFudW1lcmljLCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGFscGhhbnVtZXJpYy5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbnlCdWlsZGVyKCkge1xuICAvL2NvbWJpbmUgdmFsaWRhdG9yc1xuICB2YXIgdmFsaWRhdG9ycyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAodmFsaWRhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvcnMgZ2l2ZW4gaW4gaXRzYS5hbnkoKVwiO1xuICB9XG5cbiAgLy9jb252ZXJ0IGFsbCB2YWxpZGF0b3JzIHRvIHJlYWwgaXRzYSBpbnN0YW5jZXNcbiAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICBpZiAoIXZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgdmFsaWRhdG9yc1tpXSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZSh2YWxpZGF0b3JzW2ldKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBhbnlDaGVja2VyKHZhbCkge1xuICAgIC8vZmluZCB0aGUgZmlyc3QgdmFsaWQgbWF0Y2hcbiAgICB2YXIgdmFsaWRSZXN1bHQgPSBudWxsO1xuICAgIGZvcih2YXIgaSBpbiB2YWxpZGF0b3JzKSB7XG4gICAgICBpZiAoIXZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gdmFsaWRhdG9yc1tpXTtcblxuICAgICAgLy9zZXQgc2FtZSBjb250ZXh0IG9uIGNoaWxkcmVuXG4gICAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXMuX3BhcmVudDtcbiAgICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gdGhpcy5fa2V5O1xuXG4gICAgICAvL2V4ZWN1dGUgdmFsaWRhdG9yICYgc3RvcCBpZiB2YWxpZFxuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS52YWxpZGF0ZSh2YWwpO1xuICAgICAgaWYgKHJlc3VsdC52YWxpZCkge1xuICAgICAgICB2YWxpZFJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9zZW5kIGJhY2sgdGhlIHJlc3VsdFxuICAgIGlmICh2YWxpZFJlc3VsdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKFtcbiAgICAgICAge1xuICAgICAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFueVwiLCBcIk1hdGNoIGZvdW5kLlwiLCB0cnVlKV1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRSZXN1bHRcbiAgICAgIF0pO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhbnlcIiwgXCJObyBtYXRjaGVzIGZvdW5kLlwiLCBmYWxzZSldXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJnc0J1aWxkZXIoZXhhbXBsZSwgYWxsb3dFeHRyYUl0ZW1zKSB7XG4gIC8vZXhhbXBsZSBpcyBtaXNzaW5nIG9yIGFuIGFycmF5XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGFsbG93RXh0cmFJdGVtcyA9IGFsbG93RXh0cmFJdGVtcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcbiAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBpc0V4YW1wbGVBcnJheSA9IGhlbHBlcnMuaXNBcnJheShleGFtcGxlKTtcbiAgICBpZiAoIWlzRXhhbXBsZUFycmF5KSB7XG4gICAgICB0aHJvdyBcImluIGAuYXJndW1lbnRzKGV4YW1wbGUpYCwgZXhhbXBsZSBtdXN0IGJlIG9taXR0ZWQgb3IgYW4gYXJyYXlcIjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoZSBleGFtcGxlIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggaXRlbSBpcyBhIHZhbGlkYXRvci5cbiAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgKi9cbiAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGVbaV0pO1xuICAgIGV4YW1wbGVbaV0gPSBpdHNhSW5zdGFuY2U7XG4gICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gU3RyaW5nKGkpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGFyZ3NDaGVja2VyKHZhbCl7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgLy8gdHlwZW9mIFtdLCBudWxsLCBldGMgYXJlIG9iamVjdCwgc28gdXNlIHRoaXMgY2hlY2sgZm9yIGFjdHVhbCBvYmplY3RzXG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc0FyZ3VtZW50cyh2YWwpO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcmd1bWVudHNcIiwgXCJUeXBlIHdhcyA6XCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCksIHZhbGlkKV1cbiAgICB9KTtcbiAgICBpZiAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICB9XG5cbiAgICAvL3RvbyBtYW55IGl0ZW1zIGluIGFycmF5P1xuICAgIGlmIChhbGxvd0V4dHJhSXRlbXMgPT09IGZhbHNlICYmIHZhbC5sZW5ndGggPiBleGFtcGxlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcnJheVwiLCBcIkV4YW1wbGUgaGFzIFwiK2V4YW1wbGUubGVuZ3RoK1wiIGl0ZW1zLCBidXQgZGF0YSBoYXMgXCIrdmFsLmxlbmd0aCwgZmFsc2UpXVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IGV4YW1wbGVbaV07XG4gICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2ldOyB9O1xuICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2ldID0gbmV3VmFsOyB9O1xuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS5fdmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGFtcGxlLCBhbGxvd0V4dHJhSXRlbXMpIHtcbiAgLy9leGFtcGxlIGlzIG1pc3Npbmcgb3IgYW4gYXJyYXlcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUl0ZW1zID0gYWxsb3dFeHRyYUl0ZW1zIHx8IGFyZ3MubGVuZ3RoID09PSAwO1xuICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIGlzRXhhbXBsZUFycmF5ID0gaGVscGVycy5pc0FycmF5KGV4YW1wbGUpO1xuICAgIGlmICghaXNFeGFtcGxlQXJyYXkpIHtcbiAgICAgIHRocm93IFwiaW4gYC5hcnJheShleGFtcGxlKWAsIGV4YW1wbGUgbXVzdCBiZSBvbWl0dGVkIG9yIGFuIGFycmF5XCI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBUaGUgZXhhbXBsZSBpcyBhbiBhcnJheSB3aGVyZSBlYWNoIGl0ZW0gaXMgYSB2YWxpZGF0b3IuXG4gICogQXNzaWduIHBhcmVudCBpbnN0YW5jZSBhbmQga2V5XG4gICovXG4gIGZvcih2YXIgaSBpbiBleGFtcGxlKSB7XG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2ldKTtcbiAgICBleGFtcGxlW2ldID0gaXRzYUluc3RhbmNlO1xuICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNBcnJheSh2YWwpO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcnJheVwiLCBcIlR5cGUgd2FzIDpcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIC8vdG9vIG1hbnkgaXRlbXMgaW4gYXJyYXk/XG4gICAgaWYgKGFsbG93RXh0cmFJdGVtcyA9PT0gZmFsc2UgJiYgdmFsLmxlbmd0aCA+IGV4YW1wbGUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiRXhhbXBsZSBoYXMgXCIrZXhhbXBsZS5sZW5ndGgrXCIgaXRlbXMsIGJ1dCBkYXRhIGhhcyBcIit2YWwubGVuZ3RoLCBmYWxzZSldXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZvcih2YXIgaSBpbiBleGFtcGxlKSB7XG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gZXhhbXBsZVtpXTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxbaV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgdmFyIGRvVmFsaWRhdGVJdGVtcyA9IGFyZ3MubGVuZ3RoID4gMDtcblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzQXJyYXkodmFsKTtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJUeXBlIHdhcyA6XCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCksIHZhbGlkKV1cbiAgICB9KTtcbiAgICBpZiAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICB9XG5cbiAgICBpZiAoZG9WYWxpZGF0ZUl0ZW1zKSB7XG4gICAgICBmb3IodmFyIGkgaW4gdmFsKSB7XG4gICAgICAgIGlmICghdmFsLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcblxuICAgICAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGUpO1xuICAgICAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gU3RyaW5nKGkpO1xuICAgICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2ldOyB9O1xuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiZXR3ZWVuQnVpbGRlcihtaW4sIG1heCwgaW5jbHVzaXZlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBiZXR3ZWVuQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAoaW5jbHVzaXZlKSB7XG4gICAgICByZXR1cm4gdmFsID49IG1pbiAmJiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBiZXR3ZWVuIG1pbmltdW0gYW5kIG1heGltdW0gKGluY2x1c2l2ZSkuXCI7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdmFsID4gbWluICYmIHZhbCA8IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgYmV0d2VlbiBtaW5pbXVtIGFuZCBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBib29sZWFuQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGJvb2xlYW5DaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwiYm9vbGVhblwiO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBhIGJvb2xlYW4uXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udGFpbnNCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjb250YWluc0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5pbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgdmFyIHZhbGlkID0gaGFzSW5kZXhPZiAmJiB2YWwuaW5kZXhPZih2YWx1ZSkgPiAtMTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGN1c3RvbUJ1aWxkZXIodmFsaWRhdG9yRnVuY3Rpb24pIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApe1xuICAgIHRocm93IFwiTm8gdmFsaWRhdG9yRnVuY3Rpb24gZ2l2ZW4gaW4gaXRzYS5jdXN0b20oLi4uKVwiO1xuICB9XG5cbiAgcmV0dXJuIHZhbGlkYXRvckZ1bmN0aW9uLmJpbmQodGhpcyk7XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRhdGVCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZGF0ZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc1ZhbGlkRGF0ZSh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgZGF0ZVwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdEJ1aWxkZXIgKGRlZmF1bHRWYWwpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGRlZmF1bHQgdmFsdWUgd2FzIGdpdmVuIGluIGAuZGVmYXVsdCguLi4pYC5cIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBkZWZhdWx0UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIC8vbWFrZSBzdXJlIHRoZXJlIGlzIGEgcGFyZW50IG9iamVjdFxuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAuZGVmYXVsdCguLi4pYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3QuXCI7XG4gICAgfVxuXG4gICAgdmFyIGlzRmFsc3kgPSAhdmFsO1xuICAgIGlmIChpc0ZhbHN5KXtcbiAgICAgIHNldHRlcih0eXBlb2YgZGVmYXVsdFZhbCA9PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsKCkgOiBkZWZhdWx0VmFsKTtcbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHROb3dCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlZmF1bHROb3dSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC5kZWZhdWx0Tm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBpZiAoIXZhbCkge1xuICAgICAgc2V0dGVyKG5ldyBEYXRlKCkpO1xuICAgIH1cbiAgfTtcbn07IiwiXG52YXIgcnggPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWFpbEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbWFpbENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHJ4LnRlc3QodmFsKSA/IG51bGwgOiBcIk5vdCBhbiBlbWFpbCBhZGRyZXNzLlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtcHR5QnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVtcHR5Q2hlY2tlcih2YWwpIHtcbiAgICB2YXIgY2xhc3NUeXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG5cbiAgICBpZiAoaGVscGVycy5pc1N0cmluZyh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHZhciBudW1iZXJPZkZpZWxkcyA9IDA7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIG51bWJlck9mRmllbGRzICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtYmVyT2ZGaWVsZHMgPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IG51bWJlciBvZiBmaWVsZHMgaXM6IFwiK251bWJlck9mRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBcIlR5cGUgY2Fubm90IGJlIGVtcHR5OiBcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmRzV2l0aEJ1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVuZHNXaXRoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmxhc3RJbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgaWYgKCFoYXNJbmRleE9mKSB7XG4gICAgICByZXR1cm4gXCJEYXRhIGhhcyBubyBsYXN0SW5kZXhPZiwgc28gdGhlcmUncyBubyB3YXkgdG8gY2hlY2sgYC5lbmRzV2l0aCgpYC5cIjtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gdmFsLmxhc3RJbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKXtcbiAgICAgIHJldHVybiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlTGVuZ3RoID0gKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkgfHwgMDtcbiAgICB2YWx1ZUxlbmd0aCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgPyB2YWx1ZUxlbmd0aCA6IDE7XG4gICAgLy9vdXRzaWRlIHZhbHVlIGlzIGEgc3RyaW5nIGFuZCBpbnNpZGUgdmFsdWUgaXMgYW4gZW1wdHkgc3RyaW5nPyB0aGF0J3MgZXZlcnl3aGVyZVxuICAgIGlmICh2YWx1ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciB2YWxpZCA9IGluZGV4ID09PSAodmFsLmxlbmd0aCAtIHZhbHVlTGVuZ3RoKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJEYXRhIGNvbnRhaW5zIHRoZSB2YWx1ZSwgYnV0IGRvZXMgbm90IGVuZCB3aXRoIGl0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVxdWFsQnVpbGRlcihleGFtcGxlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGNvbXBhcmlzb24gb2JqZWN0IGdpdmVuIGluIGl0c2EuZXF1YWwoLi4uKVwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGVxdWFsQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBleGFtcGxlID09PSB2YWw7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgZGlkIG5vdCBwYXNzIGVxdWFsaXR5IHRlc3QuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc2VDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IGZhbHNlID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGBmYWxzZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYWxzeUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmYWxzeUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuICF2YWwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgZmFsc3kuXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZnVuY3Rpb25CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZnVuY3Rpb25DaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNGdW5jdGlvbih2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBhIGZ1bmN0aW9uLlwiO1xuICB9O1xufTtcbiIsIlxudmFyIHJ4ID0gL15bMC05YS1mXSokL2k7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGV4QnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhleENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmIChbXCJzdHJpbmdcIiwgXCJudW1iZXJcIl0uaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIlZhbHVlIHNob3VsZCBiZSBoZXgsIGJ1dCBpc24ndCBhIHN0cmluZyBvciBudW1iZXIuXCI7XG4gICAgfVxuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgaGV4LlwiO1xuICB9O1xufTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJhbHBoYW51bWVyaWNcIjogcmVxdWlyZSgnLi9hbHBoYW51bWVyaWMnKSxcbiAgXCJhbnlcIjogcmVxdWlyZSgnLi9hbnknKSxcbiAgXCJhcmdzXCI6IHJlcXVpcmUoJy4vYXJncycpLFxuICBcImFycmF5XCI6IHJlcXVpcmUoJy4vYXJyYXknKSxcbiAgXCJhcnJheU9mXCI6IHJlcXVpcmUoJy4vYXJyYXlPZicpLFxuICBcImJldHdlZW5cIjogcmVxdWlyZSgnLi9iZXR3ZWVuJyksXG4gIFwiYm9vbGVhblwiOiByZXF1aXJlKCcuL2Jvb2xlYW4nKSxcbiAgXCJjdXN0b21cIjogcmVxdWlyZSgnLi9jdXN0b20nKSxcbiAgXCJjb250YWluc1wiOiByZXF1aXJlKCcuL2NvbnRhaW5zJyksXG4gIFwiZGF0ZVwiOiByZXF1aXJlKCcuL2RhdGUnKSxcbiAgXCJkZWZhdWx0XCI6IHJlcXVpcmUoJy4vZGVmYXVsdCcpLFxuICBcImRlZmF1bHROb3dcIjogcmVxdWlyZSgnLi9kZWZhdWx0Tm93JyksXG4gIFwiZW1haWxcIjogcmVxdWlyZSgnLi9lbWFpbCcpLFxuICBcImVtcHR5XCI6IHJlcXVpcmUoJy4vZW1wdHknKSxcbiAgXCJlbmRzV2l0aFwiOiByZXF1aXJlKCcuL2VuZHNXaXRoJyksXG4gIFwiZXF1YWxcIjogcmVxdWlyZSgnLi9lcXVhbCcpLFxuICBcImZhbHNlXCI6IHJlcXVpcmUoJy4vZmFsc2UnKSxcbiAgXCJmYWxzeVwiOiByZXF1aXJlKCcuL2ZhbHN5JyksXG4gIFwiZnVuY3Rpb25cIjogcmVxdWlyZSgnLi9mdW5jdGlvbicpLFxuICBcImhleFwiOiByZXF1aXJlKCcuL2hleCcpLFxuICBcImludGVnZXJcIjogcmVxdWlyZSgnLi9pbnRlZ2VyJyksXG4gIFwiaW5zdGFuY2VvZlwiOiByZXF1aXJlKCcuL2luc3RhbmNlb2YnKSxcbiAgXCJqc29uXCI6IHJlcXVpcmUoJy4vanNvbicpLFxuICBcImxlblwiOiByZXF1aXJlKCcuL2xlbicpLFxuICBcImxvd2VyY2FzZVwiOiByZXF1aXJlKCcuL2xvd2VyY2FzZScpLFxuICBcIm1hdGNoZXNcIjogcmVxdWlyZSgnLi9tYXRjaGVzJyksXG4gIFwibWF4TGVuZ3RoXCI6IHJlcXVpcmUoJy4vbWF4TGVuZ3RoJyksXG4gIFwibWluTGVuZ3RoXCI6IHJlcXVpcmUoJy4vbWluTGVuZ3RoJyksXG4gIFwibmFuXCI6IHJlcXVpcmUoJy4vbmFuJyksXG4gIFwibm90RW1wdHlcIjogcmVxdWlyZSgnLi9ub3RFbXB0eScpLFxuICBcIm51bGxcIjogcmVxdWlyZSgnLi9udWxsJyksXG4gIFwibnVtYmVyXCI6IHJlcXVpcmUoJy4vbnVtYmVyJyksXG4gIFwib2JqZWN0XCI6IHJlcXVpcmUoJy4vb2JqZWN0JyksXG4gIFwib3ZlclwiOiByZXF1aXJlKCcuL292ZXInKSxcbiAgXCJyZWdleHBcIjogcmVxdWlyZSgnLi9yZWdleHAnKSxcbiAgXCJzdGFydHNXaXRoXCI6IHJlcXVpcmUoJy4vc3RhcnRzV2l0aCcpLFxuICBcInN0cmluZ1wiOiByZXF1aXJlKCcuL3N0cmluZycpLFxuICBcInRvXCI6IHJlcXVpcmUoJy4vdG8nKSxcbiAgXCJ0b0RhdGVcIjogcmVxdWlyZSgnLi90b0RhdGUnKSxcbiAgXCJ0b0Zsb2F0XCI6IHJlcXVpcmUoJy4vdG9GbG9hdCcpLFxuICBcInRvSW50ZWdlclwiOiByZXF1aXJlKCcuL3RvSW50ZWdlcicpLFxuICBcInRvTG93ZXJjYXNlXCI6IHJlcXVpcmUoJy4vdG9Mb3dlcmNhc2UnKSxcbiAgXCJ0b05vd1wiOiByZXF1aXJlKCcuL3RvTm93JyksXG4gIFwidG9TdHJpbmdcIjogcmVxdWlyZSgnLi90b1N0cmluZycpLFxuICBcInRvVHJpbW1lZFwiOiByZXF1aXJlKCcuL3RvVHJpbW1lZCcpLFxuICBcInRvVXBwZXJjYXNlXCI6IHJlcXVpcmUoJy4vdG9VcHBlcmNhc2UnKSxcbiAgXCJ0cnVlXCI6IHJlcXVpcmUoJy4vdHJ1ZScpLFxuICBcInRydXRoeVwiOiByZXF1aXJlKCcuL3RydXRoeScpLFxuICBcInR5cGVvZlwiOiByZXF1aXJlKCcuL3R5cGVvZicpLFxuICBcInVuZGVmaW5lZFwiOiByZXF1aXJlKCcuL3VuZGVmaW5lZCcpLFxuICBcInVuZGVyXCI6IHJlcXVpcmUoJy4vdW5kZXInKSxcbiAgXCJ1bmlxdWVcIjogcmVxdWlyZSgnLi91bmlxdWUnKSxcbiAgXCJ1cHBlcmNhc2VcIjogcmVxdWlyZSgnLi91cHBlcmNhc2UnKVxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluc3RhbmNlb2ZCdWlsZGVyKHR5cGUpIHtcbiAgaWYgKHR5cGVvZiB0eXBlICE9IFwiZnVuY3Rpb25cIikge1xuICAgIHRocm93IFwiSW52YWxpZCB0eXBlIGdpdmVuIHRvIGBpdHNhLmluc3RhbmNlb2YoLi4uKWA6IFwiK3R5cGU7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uIGluc3RhbmNlb2ZDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpID09PSB0eXBlLnByb3RvdHlwZTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJpbnN0YW5jZW9mIGNoZWNrIGZhaWxlZC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbnRlZ2VyQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGludGVnZXJDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCJcbiAgICAgICAgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2VcbiAgICAgICAgJiYgW051bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXS5pbmRleE9mKHZhbCkgPT09IC0xXG4gICAgICAgICYmIHZhbCAlIDEgPT09IDA7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiSW52YWxpZCBpbnRlZ2VyXCI7XG4gIH07XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGpzb25CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24ganNvbkNoZWNrZXIodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiBcIkpTT04gbXVzdCBiZSBhIHN0cmluZy5cIjtcbiAgICB9XG5cbiAgICB0cnl7XG4gICAgICBKU09OLnBhcnNlKHZhbCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9Y2F0Y2goZSl7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBpcyBhIG5vdCB2YWxpZCBKU09OIHN0cmluZy5cIjtcbiAgICB9XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsZW5CdWlsZGVyKGV4YWN0T3JNaW4sIG1heCkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICB2YXIgdmFsaWRhdGlvblR5cGUgPSBcInRydXRoeVwiO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHZhbGlkYXRpb25UeXBlID0gXCJleGFjdFwiO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDIpIHZhbGlkYXRpb25UeXBlID0gXCJiZXR3ZWVuXCI7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGxlbkNoZWNrZXIodmFsKSB7XG4gICAgdmFyIGxlbmd0aCA9ICh2YWwgfHwgKHR5cGVvZiB2YWwpID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcInRydXRoeVwiKXtcbiAgICAgIHJldHVybiBsZW5ndGggPyBudWxsIDogXCJMZW5ndGggaXMgbm90IHRydXRoeS5cIjtcbiAgICB9ZWxzZSBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwiZXhhY3RcIil7XG4gICAgICByZXR1cm4gbGVuZ3RoID09PSBleGFjdE9yTWluID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCBleGFjdGx5OiBcIitleGFjdE9yTWluO1xuICAgIH1lbHNlIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJiZXR3ZWVuXCIpe1xuICAgICAgdmFyIHZhbGlkID0gbGVuZ3RoID49IGV4YWN0T3JNaW4gJiYgbGVuZ3RoIDw9IG1heDtcbiAgICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgYmV0d2VlbiBcIitleGFjdE9yTWluICtcIiBhbmQgXCIgKyBtYXg7XG4gICAgfVxuICB9O1xufTtcbiIsIlxudmFyIHJ4ID0gL1tBLVpdLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsb3dlcmNhc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbG93ZXJjYXNlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiICYmICFyeC50ZXN0KHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgY29udGFpbnMgdXBwZXJjYXNlIGNoYXJhY3RlcnMuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYXRjaGVzQnVpbGRlcihyeCkge1xuICBpZiAocnggaW5zdGFuY2VvZiBSZWdFeHAgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgXCJgLm1hdGNoZXMoLi4uKWAgcmVxdWlyZXMgYSByZWdleHBcIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBtYXRjaGVzQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSByeC50ZXN0KHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgZG9lcyBub3QgbWF0Y2ggcmVnZXhwLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtYXgpIHtcbiAgaWYgKHR5cGVvZiBtYXggIT0gXCJudW1iZXJcIikge1xuICAgIHRocm93IFwiSW52YWxpZCBtYXhpbXVtIGluIG1heExlbmd0aDogXCIrbWF4O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIHZhciBsZW5ndGggPSAodmFsIHx8IHR5cGUgPT09IFwic3RyaW5nXCIpID8gdmFsLmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgbGVuZ3RoID09PSBcIm51bWJlclwiICYmIGxlbmd0aCA8PSBtYXg7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcIm1heExlbmd0aFwiLCBcIkxlbmd0aCBpcyBcIitsZW5ndGgrXCIsIG1heCBpcyBcIittYXgsIHZhbGlkKV0sXG4gICAgfTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtaW5MZW5ndGhCdWlsZGVyKG1pbikge1xuICBpZiAodHlwZW9mIG1pbiAhPSBcIm51bWJlclwiKSB7XG4gICAgdGhyb3cgXCJJbnZhbGlkIG1pbmltdW0gaW4gbWluTGVuZ3RoOiBcIittaW47XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uIG1pbkxlbmd0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIHZhciBsZW5ndGggPSAodmFsIHx8IHR5cGUgPT09IFwic3RyaW5nXCIpID8gdmFsLmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgbGVuZ3RoID09PSBcIm51bWJlclwiICYmIGxlbmd0aCA+PSBtaW47XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IChcIkxlbmd0aCBpcyBcIitsZW5ndGgrXCIsIG1pbmltdW0gaXMgXCIrbWluKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBuYW5CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbmFuQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gaXNOYU4odmFsKSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBOYU4uXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm90RW1wdHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbm90RW1wdHlDaGVja2VyKHZhbCkge1xuXG4gICAgaWYgKGhlbHBlcnMuaXNTdHJpbmcodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggIT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBub3QgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCAhPT0gMCA/IG51bGwgOiBcIkNhbm5vdCBiZSBlbXB0eS5cIjtcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHZhciBudW1iZXJPZkZpZWxkcyA9IDA7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIG51bWJlck9mRmllbGRzICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtYmVyT2ZGaWVsZHMgIT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBub3QgZW1wdHksIGJ1dCBudW1iZXIgb2YgZmllbGRzIGlzOiBcIitudW1iZXJPZkZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gXCJUeXBlIGNhbm5vdCBiZSBub3QtZW1wdHk6IFwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bGxCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbnVsbENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gbnVsbCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBudWxsLlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bWJlckJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBudW1iZXJDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNWYWxpZE51bWJlcih2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgbnVtYmVyXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFGaWVsZHMpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUZpZWxkcyA9IGFsbG93RXh0cmFGaWVsZHMgfHwgYXJncy5sZW5ndGggPT09IDA7XG5cbiAgLypcbiAgICogVGhlIGV4YW1wbGUgaXMgYW4gb2JqZWN0IHdoZXJlIHRoZSBrZXlzIGFyZSB0aGUgZmllbGQgbmFtZXNcbiAgICogYW5kIHRoZSB2YWx1ZXMgYXJlIGl0c2EgaW5zdGFuY2VzLlxuICAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgICovXG4gIGZvcih2YXIga2V5IGluIGV4YW1wbGUpIHtcbiAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2tleV0pO1xuICAgIGV4YW1wbGVba2V5XSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBrZXk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKTtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwib2JqZWN0XCIsIFwiVHlwZSB3YXM6IFwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy9leHRyYSBmaWVsZHMgbm90IGFsbG93ZWQ/XG4gICAgaWYgKGFsbG93RXh0cmFGaWVsZHMgPT09IGZhbHNlKSB7XG4gICAgICB2YXIgaW52YWxpZEZpZWxkcyA9IFtdO1xuICAgICAgZm9yKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIGlmICghdmFsLmhhc093blByb3BlcnR5KGtleSkpIGNvbnRpbnVlO1xuXG4gICAgICAgIGlmIChrZXkgaW4gZXhhbXBsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBpbnZhbGlkRmllbGRzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJvYmplY3RcIiwgXCJVbmV4cGVjdGVkIGZpZWxkczogXCIraW52YWxpZEZpZWxkcy5qb2luKCksIGZhbHNlKV1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IodmFyIGtleSBpbiBleGFtcGxlKSB7XG4gICAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2tleV07XG4gICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2tleV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxba2V5XSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb3ZlckJ1aWxkZXIobWluLCBpbmNsdXNpdmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG92ZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPj0gbWluID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBvdmVyIHRoZSBtaW5pbXVtIChpbmNsdXNpdmUpLlwiO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHZhbCA+IG1pbiA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3Qgb3ZlciB0aGUgbWluaW11bSAoZXhjbHVzaXZlKS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzUmVnRXhwKHZhbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcInJlZ2V4cFwiLCB2YWxpZD9cIlJlZ0V4cCB2ZXJpZmllZC5cIjpcIkV4cGVjdGVkIGEgUmVnRXhwLlwiLCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RhcnRzV2l0aEJ1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHN0YXJ0c1dpdGhDaGVja2VyKHZhbCkge1xuICAgIHZhciBoYXNJbmRleE9mID0gKHZhbCAmJiB2YWwuaW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIGlmICghaGFzSW5kZXhPZikge1xuICAgICAgcmV0dXJuIFwiRGF0YSBoYXMgbm8gaW5kZXhPZiwgc28gdGhlcmUncyBubyB3YXkgdG8gY2hlY2sgYC5zdGFydHNXaXRoKClgLlwiO1xuICAgIH1cbiAgICB2YXIgaW5kZXggPSB2YWwuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICByZXR1cm4gXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPT09IDAgPyBudWxsIDogXCJEYXRhIGNvbnRhaW5zIHRoZSB2YWx1ZSwgYnV0IGRvZXMgbm90IHN0YXJ0IHdpdGggaXQuXCI7XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzU3RyaW5nKHZhbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcInN0cmluZ1wiLCB2YWxpZD9cIlN0cmluZyBpZGVudGlmaWVkLlwiOlwiRXhwZWN0ZWQgYSBzdHJpbmcuXCIsIHZhbGlkKV0sXG4gICAgfTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0J1aWxkZXIgKHZhbHVlT3JHZXR0ZXIpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGRlZmF1bHQgdmFsdWUgd2FzIGdpdmVuIGluIGAudG8oLi4uKWAuXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gdG9SdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC50byguLi4pYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG4gICAgfVxuXG4gICAgc2V0dGVyKHR5cGVvZiB2YWx1ZU9yR2V0dGVyID09IFwiZnVuY3Rpb25cIiA/IHZhbHVlT3JHZXR0ZXIoKSA6IHZhbHVlT3JHZXR0ZXIpO1xuICB9O1xufTsiLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9EYXRlQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b0RhdGVSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b0RhdGUoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHJldHVybiBcIlVud2lsbGluZyB0byBwYXJzZSBmYWxzeSB2YWx1ZXMuXCI7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXR1cm4gXCJVbndpbGxpbmcgdG8gY3JlYXRlIGRhdGUgZnJvbSBhcnJheXMuXCI7XG4gICAgfVxuXG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgIGlmIChpc0Zpbml0ZShkYXRlKSkge1xuICAgICAgc2V0dGVyKGRhdGUpO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIHBhcnNlIGRhdGUuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0Zsb2F0QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b0Zsb2F0UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9GbG9hdCgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBwYXJzZUZsb2F0KHZhbCk7XG4gICAgaWYgKHZhbCA9PT0gbmV3VmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNOYU4obmV3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gY29udmVydCBkYXRhIHRvIGZsb2F0LlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0ludGVnZXJCdWlsZGVyIChyYWRpeCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9JbnRlZ2VyUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9JbnRlZ2VyKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IHBhcnNlSW50KHZhbCwgdHlwZW9mIHJhZGl4ID09PSBcInVuZGVmaW5lZFwiID8gMTAgOiByYWRpeCk7XG4gICAgaWYgKHZhbCA9PT0gbmV3VmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNOYU4obmV3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gY29udmVydCBkYXRhIHRvIGludGVnZXIuXCI7XG4gICAgfWVsc2V7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0xvd2VyY2FzZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9Mb3dlcmNhc2VSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b0xvd2VyY2FzZSgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Ob3dCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTm93UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAudG9Ob3coKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIHNldHRlcihuZXcgRGF0ZSgpKTtcbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9TdHJpbmdCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvU3RyaW5nUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9TdHJpbmcoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gU3RyaW5nKHZhbCk7XG4gICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1RyaW1tZWRCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVHJpbW1lZFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvVHJpbW1lZCgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRyaW0oKTtcbiAgICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1VwcGVyY2FzZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9VcHBlcmNhc2VSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1VwcGVyY2FzZSgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRvVXBwZXJDYXNlKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJ1ZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0cnVlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSB0cnVlID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGB0cnVlYC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydXRoeUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0cnV0aHlDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgdHJ1dGh5LlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHlwZW9mQnVpbGRlcih0eXBlKSB7XG4gIGlmICh0eXBlb2YgdHlwZSAhPSBcInN0cmluZ1wiKSB7XG4gICAgdGhyb3cgXCJJbnZhbGlkIHR5cGUgZ2l2ZW4gdG8gYGl0c2EudHlwZW9mKC4uLilgOiBcIit0eXBlO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiB0eXBlb2ZDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IHR5cGU7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IChcIkV4cGVjdGVkIHR5cGUgXCIrdHlwZStcIiwgYnV0IHR5cGUgaXMgXCIrKHR5cGVvZiB2YWwpKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmRlZmluZWRCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdW5kZWZpbmVkQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgdW5kZWZpbmVkLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZXJCdWlsZGVyKG1heCwgaW5jbHVzaXZlKSB7XG4gIHJldHVybiBmdW5jdGlvbiB1bmRlckNoZWNrZXIodmFsKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcmV0dXJuIHZhbCA8PSBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IHVuZGVyIHRoZSBtYXhpbXVtIChpbmNsdXNpdmUpLlwiO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHZhbCA8IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgdW5kZXIgdGhlIG1heGltdW0gKGV4Y2x1c2l2ZSkuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmlxdWVCdWlsZGVyKGdldHRlcikge1xuICByZXR1cm4gZnVuY3Rpb24gdW5pcXVlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuICAgIHZhciBpc1R5cGVWYWxpZCA9IGhlbHBlcnMuaXNBcnJheSh2YWwpIHx8IGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpIHx8IGhlbHBlcnMuaXNTdHJpbmcodmFsKTtcbiAgICBpZiAoIWlzVHlwZVZhbGlkKSB7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gY2hlY2sgdW5pcXVlbmVzcyBvbiB0aGlzIHR5cGUgb2YgZGF0YS5cIjtcbiAgICB9XG5cbiAgICB2YXIgZ2V0dGVyVHlwZSA9IFwiXCI7XG4gICAgaWYgKHR5cGVvZiBnZXR0ZXIgPT09IFwiZnVuY3Rpb25cIikgeyBnZXR0ZXJUeXBlID0gXCJmdW5jdGlvblwiOyB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGdldHRlciAhPT0gXCJ1bmRlZmluZWRcIikgeyBnZXR0ZXJUeXBlID0gXCJwbHVja1wiOyB9XG5cbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICB2YXIgaXRlbSA9IHZhbFtrZXldO1xuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpdGVtID0gZ2V0dGVyKGl0ZW0pO1xuICAgICAgfVxuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwicGx1Y2tcIikge1xuICAgICAgICBpdGVtID0gaXRlbVtnZXR0ZXJdO1xuICAgICAgfVxuICAgICAgdmFyIGFscmVhZHlGb3VuZCA9IGl0ZW1zLmluZGV4T2YoaXRlbSkgPiAtMTtcbiAgICAgIGlmIChhbHJlYWR5Rm91bmQpIHtcbiAgICAgICAgcmV0dXJuIFwiSXRlbXMgYXJlIG5vdCB1bmlxdWUuXCI7XG4gICAgICB9XG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn07XG5cbiIsIlxudmFyIHJ4ID0gL1thLXpdLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1cHBlcmNhc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdXBwZXJjYXNlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiICYmICFyeC50ZXN0KHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgY29udGFpbnMgbG93ZXJjYXNlIGNoYXJhY3RlcnMuXCI7XG4gIH07XG59O1xuXG4iXX0=
