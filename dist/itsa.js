/*! 
  * @license 
  * itsa 1.2.14 <https://github.com/bendytree/node-itsa> 
  * Copyright 2/03/2015 Josh Wright <http://www.joshwright.com> 
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
        if (!val.hasOwnProperty(key)) { continue; }

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
      logs: [this._buildLog("string", valid?"String identified.":"Expected a string.", valid)]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2hlbHBlcnMuanMiLCJsaWIvaXRzYS5qcyIsImxpYi9tZXRob2RzL192YWxpZGF0ZS5qcyIsImxpYi9tZXRob2RzL2FsaWFzLmpzIiwibGliL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0LmpzIiwibGliL21ldGhvZHMvYnVpbGQtbG9nLmpzIiwibGliL21ldGhvZHMvY29tYmluZS1yZXN1bHRzLmpzIiwibGliL21ldGhvZHMvY29udmVydC12YWxpZGF0b3ItdG8taXRzYS1pbnN0YW5jZS5qcyIsImxpYi9tZXRob2RzL2V4dGVuZC5qcyIsImxpYi9tZXRob2RzL21zZy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkT3JUaHJvdy5qcyIsImxpYi9tZXRob2RzL3ZhbGlkYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvYWxwaGFudW1lcmljLmpzIiwibGliL3ZhbGlkYXRvcnMvYW55LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJncy5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9mdW5jdGlvbi5qcyIsImxpYi92YWxpZGF0b3JzL2hleC5qcyIsImxpYi92YWxpZGF0b3JzL2luZGV4LmpzIiwibGliL3ZhbGlkYXRvcnMvaW5zdGFuY2VvZi5qcyIsImxpYi92YWxpZGF0b3JzL2ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9qc29uLmpzIiwibGliL3ZhbGlkYXRvcnMvbGVuLmpzIiwibGliL3ZhbGlkYXRvcnMvbG93ZXJjYXNlLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF0Y2hlcy5qcyIsImxpYi92YWxpZGF0b3JzL21heExlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL21pbkxlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL25hbi5qcyIsImxpYi92YWxpZGF0b3JzL25vdEVtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvbnVsbC5qcyIsImxpYi92YWxpZGF0b3JzL251bWJlci5qcyIsImxpYi92YWxpZGF0b3JzL29iamVjdC5qcyIsImxpYi92YWxpZGF0b3JzL292ZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9yZWdleHAuanMiLCJsaWIvdmFsaWRhdG9ycy9zdGFydHNXaXRoLmpzIiwibGliL3ZhbGlkYXRvcnMvc3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG8uanMiLCJsaWIvdmFsaWRhdG9ycy90b0RhdGUuanMiLCJsaWIvdmFsaWRhdG9ycy90b0Zsb2F0LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9JbnRlZ2VyLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9Mb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90b05vdy5qcyIsImxpYi92YWxpZGF0b3JzL3RvU3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9UcmltbWVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9VcHBlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90cnVlLmpzIiwibGliL3ZhbGlkYXRvcnMvdHJ1dGh5LmpzIiwibGliL3ZhbGlkYXRvcnMvdHlwZW9mLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZWZpbmVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZXIuanMiLCJsaWIvdmFsaWRhdG9ycy91bmlxdWUuanMiLCJsaWIvdmFsaWRhdG9ycy91cHBlcmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9pdHNhXCIpO1xuIiwiXG4vKipcbiAqIEEgbGlzdCBvZiBidWlsdCBpbiBhbGlhc2VzIGZvciBpdHNhIHZhbGlkYXRvcnMuXG4gKlxuICogeyBcImFsaWFzTmFtZVwiIDogXCJyZWFsTmFtZVwiIH1cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWZ0ZXJcIjogXCJvdmVyXCIsXG4gIFwiYmVmb3JlXCI6IFwidW5kZXJcIlxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpc0Jvb2xlYW46IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBCb29sZWFuXVwiO1xuICB9LFxuXG4gIGlzVmFsaWREYXRlOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgRGF0ZV1cIiAmJiBpc0Zpbml0ZSh2YWwpO1xuICB9LFxuXG4gIGlzUmVnRXhwOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgUmVnRXhwXVwiO1xuICB9LFxuXG4gIGlzRnVuY3Rpb246IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBGdW5jdGlvbl1cIjtcbiAgfSxcblxuICBpc0FycmF5OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gIH0sXG5cbiAgaXNQbGFpbk9iamVjdDogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIjtcbiAgfSxcblxuICBpc1N0cmluZzogZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIjtcbiAgfSxcblxuICBpc1ZhbGlkTnVtYmVyOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCJcbiAgICAgICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlXG4gICAgICAmJiBbTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFldLmluZGV4T2YodmFsKSA9PT0gLTE7XG4gIH0sXG5cbiAgaXNBcmd1bWVudHM6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvL2ZvciBPcGVyYVxuICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmICggXCJjYWxsZWVcIiBpbiB2YWwgKSAmJiB0eXBlb2YgdmFsLmxlbmd0aCA9PT0gXCJudW1iZXJcIjtcbiAgfVxuXG59O1xuIiwiXG52YXIgaXRzYSA9IGZ1bmN0aW9uICgpIHtcbiAgLy9mb3JjZSBgbmV3YFxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgaXRzYSkpIHsgcmV0dXJuIG5ldyBpdHNhKCk7IH1cblxuICB0aGlzLnZhbGlkYXRvcnMgPSBbXTtcbiAgdGhpcy5lcnJvck1lc3NhZ2VzID0ge307XG59O1xuXG4vLyBQcml2YXRlXG5pdHNhLnByb3RvdHlwZS5fYnVpbGRMb2cgPSByZXF1aXJlKFwiLi9tZXRob2RzL2J1aWxkLWxvZ1wiKTtcbml0c2EucHJvdG90eXBlLl9idWlsZEZpbmFsUmVzdWx0ID0gcmVxdWlyZShcIi4vbWV0aG9kcy9idWlsZC1maW5hbC1yZXN1bHRcIik7XG5pdHNhLnByb3RvdHlwZS5fY29tYmluZVJlc3VsdHMgPSByZXF1aXJlKFwiLi9tZXRob2RzL2NvbWJpbmUtcmVzdWx0c1wiKTtcbml0c2EucHJvdG90eXBlLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UgPSByZXF1aXJlKFwiLi9tZXRob2RzL2NvbnZlcnQtdmFsaWRhdG9yLXRvLWl0c2EtaW5zdGFuY2VcIik7XG5pdHNhLnByb3RvdHlwZS5fdmFsaWRhdGUgPSByZXF1aXJlKFwiLi9tZXRob2RzL192YWxpZGF0ZVwiKTtcbml0c2EucHJvdG90eXBlLl9pdHNhID0gaXRzYTtcblxuLy8gUHVibGljXG5pdHNhLnByb3RvdHlwZS52YWxpZGF0ZSA9IHJlcXVpcmUoXCIuL21ldGhvZHMvdmFsaWRhdGVcIik7XG5pdHNhLnByb3RvdHlwZS52YWxpZE9yVGhyb3cgPSByZXF1aXJlKFwiLi9tZXRob2RzL3ZhbGlkT3JUaHJvd1wiKTtcbml0c2EucHJvdG90eXBlLm1zZyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvbXNnXCIpO1xuaXRzYS5leHRlbmQgPSByZXF1aXJlKFwiLi9tZXRob2RzL2V4dGVuZFwiKTtcbml0c2EuYWxpYXMgPSByZXF1aXJlKFwiLi9tZXRob2RzL2FsaWFzXCIpO1xuXG4vLyBCdWlsdCBpbiB2YWxpZGF0b3JzXG5pdHNhLmV4dGVuZChyZXF1aXJlKFwiLi92YWxpZGF0b3JzXCIpKTtcblxuLy8gQWRkIGFsaWFzZXNcbnZhciBhbGlhc2VzID0gcmVxdWlyZShcIi4vYWxpYXNlc1wiKTtcbmZvciAodmFyIGtleSBpbiBhbGlhc2VzKXtcbiAgaXRzYS5hbGlhcyhhbGlhc2VzW2tleV0sIGtleSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpdHNhO1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF92YWxpZGF0ZShnZXR0ZXIsIHNldHRlcikge1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuICBmb3IgKHZhciBpIGluIHRoaXMudmFsaWRhdG9ycykge1xuICAgIGlmICghdGhpcy52YWxpZGF0b3JzLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcblxuICAgIHZhciB2YWxpZGF0b3IgPSB0aGlzLnZhbGlkYXRvcnNbaV07XG5cbiAgICAvL2dldCByZXN1bHRcbiAgICB2YXIgcmVzdWx0ID0gcnVuVmFsaWRhdG9yKHRoaXMsIHZhbGlkYXRvciwgZ2V0dGVyLCBzZXR0ZXIpO1xuXG4gICAgLy9pbnRlcnByZXQgcmVzdWx0XG4gICAgcmVzdWx0ID0gaW50ZXJwcmV0UmVzdWx0KHRoaXMsIHJlc3VsdCk7XG5cbiAgICAvL2N1c3RvbSBlcnJvclxuICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlICYmIHRoaXMuZXJyb3JNZXNzYWdlc1t2YWxpZGF0b3JdKXtcbiAgICAgIHJlc3VsdC5sb2dzWzBdLmN1c3RvbU1lc3NhZ2UgPSB0aGlzLmVycm9yTWVzc2FnZXNbdmFsaWRhdG9yXTtcbiAgICB9XG5cbiAgICAvL2FkZCBpdCB0byBsaXN0IG9mIHJlc3VsdHNcbiAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgIC8vaW52YWxpZD8gc2hvcnQgY2lyY3VpdFxuICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlKSB7IGJyZWFrOyB9XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2J1aWxkRmluYWxSZXN1bHQodGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cykpO1xufTtcblxudmFyIHJ1blZhbGlkYXRvciA9IGZ1bmN0aW9uIChpdHNhSW5zdGFuY2UsIHZhbGlkYXRvciwgZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgdHJ5e1xuICAgIC8vYWxyZWFkeSBhbiBpdHNhIGluc3RhbmNlPyBqdXN0IHJ1biB2YWxpZGF0ZVxuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcIm9iamVjdFwiICYmIHZhbGlkYXRvciBpbnN0YW5jZW9mIGl0c2FJbnN0YW5jZS5faXRzYSkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRvci52YWxpZGF0ZShnZXR0ZXIsIHNldHRlcik7XG4gICAgfVxuXG4gICAgLy90aW1lIHRvIGdldCB0aGUgcmVhbCB2YWx1ZSAoY291bGQgYmUgYSB2YWx1ZSBvciBhIGZ1bmN0aW9uKVxuICAgIHZhciB2YWwgPSB0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIgPyBnZXR0ZXIoKSA6IGdldHRlcjtcblxuICAgIC8vYSBmdW5jdGlvbj9cbiAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIC8vdHJ5IGEgY2xhc3MgdHlwZSBjaGVja1xuICAgICAgdmFyIGNsYXNzVHlwZVJlc3VsdCA9IHJ1bkNsYXNzVHlwZVZhbGlkYXRvcih2YWxpZGF0b3IsIHZhbCk7XG4gICAgICBpZiAoY2xhc3NUeXBlUmVzdWx0ICE9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gY2xhc3NUeXBlUmVzdWx0O1xuICAgICAgfVxuXG4gICAgICAvL3J1biB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgdmFsdWVcbiAgICAgIHJldHVybiB2YWxpZGF0b3IuY2FsbChpdHNhSW5zdGFuY2UsIHZhbCwgc2V0dGVyKTtcbiAgICB9XG5cbiAgICAvL3NvbWV0aGluZyBlbHNlLCBzbyB0aGlzIGlzIGEgPT09IGNoZWNrXG4gICAgcmV0dXJuIHZhbCA9PT0gdmFsaWRhdG9yO1xuICB9Y2F0Y2goZSl7XG4gICAgLy9jb25zb2xlLnRyYWNlKCk7XG4gICAgLy9jb25zb2xlLmVycm9yKGUpO1xuICAgIHJldHVybiBcIlVuaGFuZGxlZCBlcnJvci4gXCIrU3RyaW5nKGUpO1xuICB9XG59O1xuXG52YXIgaW50ZXJwcmV0UmVzdWx0ID0gZnVuY3Rpb24gKGl0c2FJbnN0YW5jZSwgcmVzdWx0KSB7XG4gIC8vcmVzdWx0IGlzIGEgYm9vbGVhbj9cbiAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiByZXN1bHQsXG4gICAgICBsb2dzOiBbaXRzYUluc3RhbmNlLl9idWlsZExvZyhcImZ1bmN0aW9uXCIsIHJlc3VsdD9cIlZhbGlkYXRpb24gc3VjY2VlZGVkXCI6XCJWYWxpZGF0aW9uIGZhaWxlZFwiLCByZXN1bHQpXVxuICAgIH07XG4gIH1cblxuICAvL3Jlc3VsdCBpcyBhbiBvYmplY3Q/XG4gIGlmIChoZWxwZXJzLmlzUGxhaW5PYmplY3QocmVzdWx0KSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvL290aGVyd2lzZSBpbnRlcnByZXQgaXQgYXMgc3RyaW5nPWVycm9yXG4gIHZhciB2YWxpZCA9IHR5cGVvZiByZXN1bHQgIT09IFwic3RyaW5nXCIgfHwgIXJlc3VsdDtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgbG9nczogW2l0c2FJbnN0YW5jZS5fYnVpbGRMb2coXCJmdW5jdGlvblwiLCB2YWxpZD9cIlZhbGlkYXRpb24gc3VjY2VlZGVkXCI6cmVzdWx0LCB2YWxpZCldXG4gIH07XG59O1xuXG52YXIgcnVuQ2xhc3NUeXBlVmFsaWRhdG9yID0gZnVuY3Rpb24oY2xzLCB2YWwpIHtcbiAgdmFyIGNsYXNzTWFwcyA9IFtcbiAgICB7IGNsczogQm9vbGVhbiwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzQm9vbGVhbiB9LFxuICAgIHsgY2xzOiBTdHJpbmcsIHZhbGlkYXRvcjogaGVscGVycy5pc1N0cmluZyB9LFxuICAgIHsgY2xzOiBOdW1iZXIsIHZhbGlkYXRvcjogaGVscGVycy5pc1ZhbGlkTnVtYmVyIH0sXG4gICAgeyBjbHM6IE9iamVjdCwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzUGxhaW5PYmplY3QgfSxcbiAgICB7IGNsczogRGF0ZSwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzVmFsaWREYXRlIH0sXG4gICAgeyBjbHM6IEFycmF5LCB2YWxpZGF0b3I6IGhlbHBlcnMuaXNBcnJheSB9LFxuICAgIHsgY2xzOiBSZWdFeHAsIHZhbGlkYXRvcjogaGVscGVycy5pc1JlZ0V4cCB9LFxuICAgIHsgY2xzOiBGdW5jdGlvbiwgdmFsaWRhdG9yOiBoZWxwZXJzLmlzRnVuY3Rpb24gfVxuICBdO1xuICBmb3IgKHZhciBpIGluIGNsYXNzTWFwcykge1xuICAgIGlmICghY2xhc3NNYXBzLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcblxuICAgIHZhciBjbGFzc01hcCA9IGNsYXNzTWFwc1tpXTtcbiAgICBpZiAoY2xzID09PSBjbGFzc01hcC5jbHMpIHtcbiAgICAgIHJldHVybiBjbGFzc01hcC52YWxpZGF0b3IodmFsKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG4iLCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFsaWFzKG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgdGhpc1tuZXdOYW1lXSA9IHRoaXMucHJvdG90eXBlW25ld05hbWVdID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpc1tvbGROYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG59O1xuIiwiXG52YXIgRmluYWxSZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHRoaXMudmFsaWQgPSByZXN1bHQudmFsaWQ7XG4gIHRoaXMubG9ncyA9IHJlc3VsdC5sb2dzO1xufTtcblxuRmluYWxSZXN1bHQucHJvdG90eXBlLmRlc2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAvL3ZhbGlkPyBjb29sIHN0b3J5IGJyb1xuICBpZiAodGhpcy52YWxpZCkge1xuICAgIHJldHVybiBcIlZhbGlkYXRpb24gc3VjY2VlZGVkLlwiO1xuICB9XG5cbiAgLy9pbnZhbGlkXG4gIHZhciBtZXNzYWdlcyA9IFtdO1xuICBmb3IgKHZhciBpIGluIHRoaXMubG9ncyl7XG4gICAgaWYgKCF0aGlzLmxvZ3MuaGFzT3duUHJvcGVydHkoaSkpIHsgY29udGludWU7IH1cblxuICAgIHZhciBsb2cgPSB0aGlzLmxvZ3NbaV07XG4gICAgaWYgKGxvZy52YWxpZCkgY29udGludWU7XG4gICAgaWYgKGxvZy5jdXN0b21NZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKGxvZy5jdXN0b21NZXNzYWdlKTtcbiAgICB9ZWxzZXtcbiAgICAgIG1lc3NhZ2VzLnB1c2goKGxvZy5wYXRoID8gKGxvZy5wYXRoICsgXCI6IFwiKSA6IFwiXCIpICsgbG9nLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlcy5qb2luKFwiXFxuXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHJldHVybiBuZXcgRmluYWxSZXN1bHQocmVzdWx0KTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yLCBtc2csIHZhbGlkKSB7XG4gIHZhciBwYXRocyA9IFtdO1xuICB2YXIgbm9kZSA9IHRoaXM7XG4gIHdoaWxlIChub2RlICYmIG5vZGUuX2tleSkge1xuICAgIHBhdGhzLnNwbGljZSgwLCAwLCBub2RlLl9rZXkpO1xuICAgIG5vZGUgPSBub2RlLl9wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgcGF0aDogcGF0aHMuam9pbihcIi5cIiksXG4gICAgdmFsaWRhdG9yOiB2YWxpZGF0b3IsXG4gICAgbWVzc2FnZTogbXNnLFxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gIC8vb25lIHJlc3VsdD8gc2hvcnRjdXRcbiAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gIH1cblxuICB2YXIgdmFsaWQgPSB0cnVlO1xuICB2YXIgbG9ncyA9IFtdO1xuXG4gIGZvciAodmFyIGkgaW4gcmVzdWx0cykge1xuICAgIGlmICghcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG5cbiAgICB2YXIgcmVzdWx0ID0gcmVzdWx0c1tpXTtcbiAgICB2YWxpZCA9IHZhbGlkICYmIHJlc3VsdC52YWxpZDtcblxuICAgIGlmIChyZXN1bHQubG9ncyAmJiByZXN1bHQubG9ncy5sZW5ndGgpIHtcbiAgICAgIGxvZ3MucHVzaC5hcHBseShsb2dzLCByZXN1bHQubG9ncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdmFsaWQ6IHZhbGlkLCBsb2dzOiBsb2dzIH07XG59OyIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yKSB7XG4gIC8vYWxyZWFkeSBhbiBgaXRzYWAgaW5zdGFuY2U/XG4gIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcIm9iamVjdFwiICYmIHZhbGlkYXRvciBpbnN0YW5jZW9mIHRoaXMuX2l0c2EpIHtcbiAgICByZXR1cm4gdmFsaWRhdG9yO1xuICB9XG5cbiAgLy9ub3QgYW4gaW5zdGFuY2UgeWV0LCBzbyBjcmVhdGUgb25lXG4gIHZhciBpbnN0YW5jZSA9IG5ldyB0aGlzLl9pdHNhKCk7XG4gIGluc3RhbmNlLnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICByZXR1cm4gaW5zdGFuY2U7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZChleHRlbnNpb25zKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gZXh0ZW5zaW9ucykge1xuICAgIC8vaWdub3JlIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gICAgaWYgKCFleHRlbnNpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICBhc3NpZ24odGhpcywgbmFtZSwgZXh0ZW5zaW9uc1tuYW1lXSk7XG4gIH1cbn07XG5cbnZhciBhc3NpZ24gPSBmdW5jdGlvbiAoaXRzYSwgbmFtZSwgYnVpbGRlcikge1xuXG4gIC8qKlxuICAgKiBBbGxvd3Mgc3RhdGljIGFjY2VzcyAtIGxpa2UgYGl0c2Euc3RyaW5nKClgXG4gICAqL1xuICBpdHNhW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBpdHNhKCk7XG4gICAgaW5zdGFuY2UudmFsaWRhdG9ycyA9IFtidWlsZGVyLmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpXTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFsbG93cyBjaGFpbmluZyAtIGxpa2UgYGl0c2Euc29tZXRoaW5nKCkuc3RyaW5nKClgXG4gICAqL1xuICBpdHNhLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbGlkYXRvcnMucHVzaChidWlsZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbXNnKG1zZykge1xuICBpZiAodHlwZW9mIG1zZyAhPT0gXCJzdHJpbmdcIiB8fCAhbXNnKSB7XG4gICAgdGhyb3cgXCIubXNnKC4uLikgbXVzdCBiZSBnaXZlbiBhbiBlcnJvciBtZXNzYWdlXCI7XG4gIH1cblxuICB0aGlzLmVycm9yTWVzc2FnZXNbdGhpcy52YWxpZGF0b3JzW3RoaXMudmFsaWRhdG9ycy5sZW5ndGgtMV1dID0gbXNnO1xuXG4gIHJldHVybiB0aGlzO1xufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRPclRocm93KHZhbHVlKSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLnZhbGlkYXRlKHZhbHVlKTtcbiAgaWYgKHJlc3VsdC52YWxpZCA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyByZXN1bHQuZGVzY3JpYmUoKTtcbiAgfVxufTtcbiIsIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRhdGUodmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlKGZ1bmN0aW9uIHZhbHVlR2V0dGVyKCl7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KTtcbn07XG4iLCJcbnZhciByeCA9IC9eWzAtOWEtel0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFscGhhbnVtZXJpY0J1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhbHBoYW51bWVyaWNDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgYWxwaGFudW1lcmljLCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGFscGhhbnVtZXJpYy5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbnlCdWlsZGVyKCkge1xuICAvL2NvbWJpbmUgdmFsaWRhdG9yc1xuICB2YXIgdmFsaWRhdG9ycyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAodmFsaWRhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvcnMgZ2l2ZW4gaW4gaXRzYS5hbnkoKVwiO1xuICB9XG5cbiAgLy9jb252ZXJ0IGFsbCB2YWxpZGF0b3JzIHRvIHJlYWwgaXRzYSBpbnN0YW5jZXNcbiAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICBpZiAoIXZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgdmFsaWRhdG9yc1tpXSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZSh2YWxpZGF0b3JzW2ldKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBhbnlDaGVja2VyKHZhbCkge1xuICAgIC8vZmluZCB0aGUgZmlyc3QgdmFsaWQgbWF0Y2hcbiAgICB2YXIgdmFsaWRSZXN1bHQgPSBudWxsO1xuICAgIGZvcih2YXIgaSBpbiB2YWxpZGF0b3JzKSB7XG4gICAgICBpZiAoIXZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gdmFsaWRhdG9yc1tpXTtcblxuICAgICAgLy9zZXQgc2FtZSBjb250ZXh0IG9uIGNoaWxkcmVuXG4gICAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXMuX3BhcmVudDtcbiAgICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gdGhpcy5fa2V5O1xuXG4gICAgICAvL2V4ZWN1dGUgdmFsaWRhdG9yICYgc3RvcCBpZiB2YWxpZFxuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS52YWxpZGF0ZSh2YWwpO1xuICAgICAgaWYgKHJlc3VsdC52YWxpZCkge1xuICAgICAgICB2YWxpZFJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9zZW5kIGJhY2sgdGhlIHJlc3VsdFxuICAgIGlmICh2YWxpZFJlc3VsdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKFtcbiAgICAgICAge1xuICAgICAgICAgIHZhbGlkOiB0cnVlLFxuICAgICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFueVwiLCBcIk1hdGNoIGZvdW5kLlwiLCB0cnVlKV1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRSZXN1bHRcbiAgICAgIF0pO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhbnlcIiwgXCJObyBtYXRjaGVzIGZvdW5kLlwiLCBmYWxzZSldXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJnc0J1aWxkZXIoZXhhbXBsZSwgYWxsb3dFeHRyYUl0ZW1zKSB7XG4gIC8vZXhhbXBsZSBpcyBtaXNzaW5nIG9yIGFuIGFycmF5XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGFsbG93RXh0cmFJdGVtcyA9IGFsbG93RXh0cmFJdGVtcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcbiAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBpc0V4YW1wbGVBcnJheSA9IGhlbHBlcnMuaXNBcnJheShleGFtcGxlKTtcbiAgICBpZiAoIWlzRXhhbXBsZUFycmF5KSB7XG4gICAgICB0aHJvdyBcImluIGAuYXJndW1lbnRzKGV4YW1wbGUpYCwgZXhhbXBsZSBtdXN0IGJlIG9taXR0ZWQgb3IgYW4gYXJyYXlcIjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoZSBleGFtcGxlIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggaXRlbSBpcyBhIHZhbGlkYXRvci5cbiAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgKi9cbiAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoaSkpIHsgY29udGludWU7IH1cblxuICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZVtpXSk7XG4gICAgZXhhbXBsZVtpXSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBTdHJpbmcoaSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gYXJnc0NoZWNrZXIodmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzQXJndW1lbnRzKHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFyZ3VtZW50c1wiLCBcIlR5cGUgd2FzIDpcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIC8vdG9vIG1hbnkgaXRlbXMgaW4gYXJyYXk/XG4gICAgaWYgKGFsbG93RXh0cmFJdGVtcyA9PT0gZmFsc2UgJiYgdmFsLmxlbmd0aCA+IGV4YW1wbGUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiRXhhbXBsZSBoYXMgXCIrZXhhbXBsZS5sZW5ndGgrXCIgaXRlbXMsIGJ1dCBhcmd1bWVudHMgaGFzIFwiK3ZhbC5sZW5ndGgsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShpKSkgeyBjb250aW51ZTsgfVxuXG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gZXhhbXBsZVtpXTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxbaV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLl92YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFJdGVtcykge1xuICAvL2V4YW1wbGUgaXMgbWlzc2luZyBvciBhbiBhcnJheVxuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBhbGxvd0V4dHJhSXRlbXMgPSBhbGxvd0V4dHJhSXRlbXMgfHwgYXJncy5sZW5ndGggPT09IDA7XG4gIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgaXNFeGFtcGxlQXJyYXkgPSBoZWxwZXJzLmlzQXJyYXkoZXhhbXBsZSk7XG4gICAgaWYgKCFpc0V4YW1wbGVBcnJheSkge1xuICAgICAgdGhyb3cgXCJpbiBgLmFycmF5KGV4YW1wbGUpYCwgZXhhbXBsZSBtdXN0IGJlIG9taXR0ZWQgb3IgYW4gYXJyYXlcIjtcbiAgICB9XG4gIH1cblxuICAvKlxuICAqIFRoZSBleGFtcGxlIGlzIGFuIGFycmF5IHdoZXJlIGVhY2ggaXRlbSBpcyBhIHZhbGlkYXRvci5cbiAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgKi9cbiAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGVbaV0pO1xuICAgIGV4YW1wbGVbaV0gPSBpdHNhSW5zdGFuY2U7XG4gICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gU3RyaW5nKGkpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG5cbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuXG4gICAgLy8gdHlwZW9mIFtdLCBudWxsLCBldGMgYXJlIG9iamVjdCwgc28gdXNlIHRoaXMgY2hlY2sgZm9yIGFjdHVhbCBvYmplY3RzXG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc0FycmF5KHZhbCk7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiVHlwZSB3YXMgOlwiK09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy90b28gbWFueSBpdGVtcyBpbiBhcnJheT9cbiAgICBpZiAoYWxsb3dFeHRyYUl0ZW1zID09PSBmYWxzZSAmJiB2YWwubGVuZ3RoID4gZXhhbXBsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJFeGFtcGxlIGhhcyBcIitleGFtcGxlLmxlbmd0aCtcIiBpdGVtcywgYnV0IGRhdGEgaGFzIFwiK3ZhbC5sZW5ndGgsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2ldO1xuICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtpXSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UuX3ZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICB2YXIgZG9WYWxpZGF0ZUl0ZW1zID0gYXJncy5sZW5ndGggPiAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNBcnJheSh2YWwpO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhcnJheVwiLCBcIlR5cGUgd2FzIDpcIitPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIGlmIChkb1ZhbGlkYXRlSXRlbXMpIHtcbiAgICAgIGZvcih2YXIgaSBpbiB2YWwpIHtcbiAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoaSkpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZSk7XG4gICAgICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICAgICAgaXRzYUluc3RhbmNlLl9rZXkgPSBTdHJpbmcoaSk7XG4gICAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxbaV07IH07XG4gICAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtpXSA9IG5ld1ZhbDsgfTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS5fdmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJldHdlZW5CdWlsZGVyKG1pbiwgbWF4LCBpbmNsdXNpdmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGJldHdlZW5DaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPj0gbWluICYmIHZhbCA8PSBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IGJldHdlZW4gbWluaW11bSBhbmQgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPiBtaW4gJiYgdmFsIDwgbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBiZXR3ZWVuIG1pbmltdW0gYW5kIG1heGltdW0gKGV4Y2x1c2l2ZSkuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJvb2xlYW5CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gYm9vbGVhbkNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJib29sZWFuXCI7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGEgYm9vbGVhbi5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb250YWluc0J1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbnRhaW5zQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmluZGV4T2YpIHx8ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKTtcbiAgICB2YXIgdmFsaWQgPSBoYXNJbmRleE9mICYmIHZhbC5pbmRleE9mKHZhbHVlKSA+IC0xO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3VzdG9tQnVpbGRlcih2YWxpZGF0b3JGdW5jdGlvbikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyB2YWxpZGF0b3JGdW5jdGlvbiBnaXZlbiBpbiBpdHNhLmN1c3RvbSguLi4pXCI7XG4gIH1cblxuICByZXR1cm4gdmFsaWRhdG9yRnVuY3Rpb24uYmluZCh0aGlzKTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGF0ZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkYXRlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzVmFsaWREYXRlKHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiSW52YWxpZCBkYXRlXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0QnVpbGRlciAoZGVmYXVsdFZhbCkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDApe1xuICAgIHRocm93IFwiTm8gZGVmYXVsdCB2YWx1ZSB3YXMgZ2l2ZW4gaW4gYC5kZWZhdWx0KC4uLilgLlwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlZmF1bHRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgLy9tYWtlIHN1cmUgdGhlcmUgaXMgYSBwYXJlbnQgb2JqZWN0XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC5kZWZhdWx0KC4uLilgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdC5cIjtcbiAgICB9XG5cbiAgICB2YXIgaXNGYWxzeSA9ICF2YWw7XG4gICAgaWYgKGlzRmFsc3kpe1xuICAgICAgc2V0dGVyKHR5cGVvZiBkZWZhdWx0VmFsID09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWwoKSA6IGRlZmF1bHRWYWwpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdE5vd0J1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZGVmYXVsdE5vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLmRlZmF1bHROb3coKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIGlmICghdmFsKSB7XG4gICAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gICAgfVxuICB9O1xufTsiLCJcbnZhciByeCA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtYWlsQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVtYWlsQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiTm90IGFuIGVtYWlsIGFkZHJlc3MuXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1wdHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZW1wdHlDaGVja2VyKHZhbCkge1xuICAgIHZhciBjbGFzc1R5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcblxuICAgIGlmIChoZWxwZXJzLmlzU3RyaW5nKHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgdmFyIG51bWJlck9mRmllbGRzID0gMDtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoa2V5KSkgeyBjb250aW51ZTsgfVxuICAgICAgICBudW1iZXJPZkZpZWxkcyArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bWJlck9mRmllbGRzID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBudW1iZXIgb2YgZmllbGRzIGlzOiBcIitudW1iZXJPZkZpZWxkcztcbiAgICB9XG5cbiAgICByZXR1cm4gXCJUeXBlIGNhbm5vdCBiZSBlbXB0eTogXCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5kc1dpdGhCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbmRzV2l0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5sYXN0SW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIGlmICghaGFzSW5kZXhPZikge1xuICAgICAgcmV0dXJuIFwiRGF0YSBoYXMgbm8gbGFzdEluZGV4T2YsIHNvIHRoZXJlJ3Mgbm8gd2F5IHRvIGNoZWNrIGAuZW5kc1dpdGgoKWAuXCI7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHZhbC5sYXN0SW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICByZXR1cm4gXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUxlbmd0aCA9ICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHx8IDA7XG4gICAgdmFsdWVMZW5ndGggPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gdmFsdWVMZW5ndGggOiAxO1xuICAgIC8vb3V0c2lkZSB2YWx1ZSBpcyBhIHN0cmluZyBhbmQgaW5zaWRlIHZhbHVlIGlzIGFuIGVtcHR5IHN0cmluZz8gdGhhdCdzIGV2ZXJ5d2hlcmVcbiAgICBpZiAodmFsdWVMZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgdmFsaWQgPSBpbmRleCA9PT0gKHZhbC5sZW5ndGggLSB2YWx1ZUxlbmd0aCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiRGF0YSBjb250YWlucyB0aGUgdmFsdWUsIGJ1dCBkb2VzIG5vdCBlbmQgd2l0aCBpdC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlcXVhbEJ1aWxkZXIoZXhhbXBsZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBjb21wYXJpc29uIG9iamVjdCBnaXZlbiBpbiBpdHNhLmVxdWFsKC4uLilcIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBlcXVhbENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gZXhhbXBsZSA9PT0gdmFsO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRpZCBub3QgcGFzcyBlcXVhbGl0eSB0ZXN0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhbHNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZhbHNlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSBmYWxzZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgZmFsc2VgLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc3lCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc3lDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiAhdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGZhbHN5LlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZ1bmN0aW9uQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZ1bmN0aW9uQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBoZWxwZXJzLmlzRnVuY3Rpb24odmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvbi5cIjtcbiAgfTtcbn07XG4iLCJcbnZhciByeCA9IC9eWzAtOWEtZl0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhleEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoZXhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgaGV4LCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGhleC5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWxwaGFudW1lcmljXCI6IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljJyksXG4gIFwiYW55XCI6IHJlcXVpcmUoJy4vYW55JyksXG4gIFwiYXJnc1wiOiByZXF1aXJlKCcuL2FyZ3MnKSxcbiAgXCJhcnJheVwiOiByZXF1aXJlKCcuL2FycmF5JyksXG4gIFwiYXJyYXlPZlwiOiByZXF1aXJlKCcuL2FycmF5T2YnKSxcbiAgXCJiZXR3ZWVuXCI6IHJlcXVpcmUoJy4vYmV0d2VlbicpLFxuICBcImJvb2xlYW5cIjogcmVxdWlyZSgnLi9ib29sZWFuJyksXG4gIFwiY3VzdG9tXCI6IHJlcXVpcmUoJy4vY3VzdG9tJyksXG4gIFwiY29udGFpbnNcIjogcmVxdWlyZSgnLi9jb250YWlucycpLFxuICBcImRhdGVcIjogcmVxdWlyZSgnLi9kYXRlJyksXG4gIFwiZGVmYXVsdFwiOiByZXF1aXJlKCcuL2RlZmF1bHQnKSxcbiAgXCJkZWZhdWx0Tm93XCI6IHJlcXVpcmUoJy4vZGVmYXVsdE5vdycpLFxuICBcImVtYWlsXCI6IHJlcXVpcmUoJy4vZW1haWwnKSxcbiAgXCJlbXB0eVwiOiByZXF1aXJlKCcuL2VtcHR5JyksXG4gIFwiZW5kc1dpdGhcIjogcmVxdWlyZSgnLi9lbmRzV2l0aCcpLFxuICBcImVxdWFsXCI6IHJlcXVpcmUoJy4vZXF1YWwnKSxcbiAgXCJmYWxzZVwiOiByZXF1aXJlKCcuL2ZhbHNlJyksXG4gIFwiZmFsc3lcIjogcmVxdWlyZSgnLi9mYWxzeScpLFxuICBcImZ1bmN0aW9uXCI6IHJlcXVpcmUoJy4vZnVuY3Rpb24nKSxcbiAgXCJoZXhcIjogcmVxdWlyZSgnLi9oZXgnKSxcbiAgXCJpbnRlZ2VyXCI6IHJlcXVpcmUoJy4vaW50ZWdlcicpLFxuICBcImluc3RhbmNlb2ZcIjogcmVxdWlyZSgnLi9pbnN0YW5jZW9mJyksXG4gIFwianNvblwiOiByZXF1aXJlKCcuL2pzb24nKSxcbiAgXCJsZW5cIjogcmVxdWlyZSgnLi9sZW4nKSxcbiAgXCJsb3dlcmNhc2VcIjogcmVxdWlyZSgnLi9sb3dlcmNhc2UnKSxcbiAgXCJtYXRjaGVzXCI6IHJlcXVpcmUoJy4vbWF0Y2hlcycpLFxuICBcIm1heExlbmd0aFwiOiByZXF1aXJlKCcuL21heExlbmd0aCcpLFxuICBcIm1pbkxlbmd0aFwiOiByZXF1aXJlKCcuL21pbkxlbmd0aCcpLFxuICBcIm5hblwiOiByZXF1aXJlKCcuL25hbicpLFxuICBcIm5vdEVtcHR5XCI6IHJlcXVpcmUoJy4vbm90RW1wdHknKSxcbiAgXCJudWxsXCI6IHJlcXVpcmUoJy4vbnVsbCcpLFxuICBcIm51bWJlclwiOiByZXF1aXJlKCcuL251bWJlcicpLFxuICBcIm9iamVjdFwiOiByZXF1aXJlKCcuL29iamVjdCcpLFxuICBcIm92ZXJcIjogcmVxdWlyZSgnLi9vdmVyJyksXG4gIFwicmVnZXhwXCI6IHJlcXVpcmUoJy4vcmVnZXhwJyksXG4gIFwic3RhcnRzV2l0aFwiOiByZXF1aXJlKCcuL3N0YXJ0c1dpdGgnKSxcbiAgXCJzdHJpbmdcIjogcmVxdWlyZSgnLi9zdHJpbmcnKSxcbiAgXCJ0b1wiOiByZXF1aXJlKCcuL3RvJyksXG4gIFwidG9EYXRlXCI6IHJlcXVpcmUoJy4vdG9EYXRlJyksXG4gIFwidG9GbG9hdFwiOiByZXF1aXJlKCcuL3RvRmxvYXQnKSxcbiAgXCJ0b0ludGVnZXJcIjogcmVxdWlyZSgnLi90b0ludGVnZXInKSxcbiAgXCJ0b0xvd2VyY2FzZVwiOiByZXF1aXJlKCcuL3RvTG93ZXJjYXNlJyksXG4gIFwidG9Ob3dcIjogcmVxdWlyZSgnLi90b05vdycpLFxuICBcInRvU3RyaW5nXCI6IHJlcXVpcmUoJy4vdG9TdHJpbmcnKSxcbiAgXCJ0b1RyaW1tZWRcIjogcmVxdWlyZSgnLi90b1RyaW1tZWQnKSxcbiAgXCJ0b1VwcGVyY2FzZVwiOiByZXF1aXJlKCcuL3RvVXBwZXJjYXNlJyksXG4gIFwidHJ1ZVwiOiByZXF1aXJlKCcuL3RydWUnKSxcbiAgXCJ0cnV0aHlcIjogcmVxdWlyZSgnLi90cnV0aHknKSxcbiAgXCJ0eXBlb2ZcIjogcmVxdWlyZSgnLi90eXBlb2YnKSxcbiAgXCJ1bmRlZmluZWRcIjogcmVxdWlyZSgnLi91bmRlZmluZWQnKSxcbiAgXCJ1bmRlclwiOiByZXF1aXJlKCcuL3VuZGVyJyksXG4gIFwidW5pcXVlXCI6IHJlcXVpcmUoJy4vdW5pcXVlJyksXG4gIFwidXBwZXJjYXNlXCI6IHJlcXVpcmUoJy4vdXBwZXJjYXNlJylcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbnN0YW5jZW9mQnVpbGRlcih0eXBlKSB7XG4gIGlmICh0eXBlb2YgdHlwZSAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgdHlwZSBnaXZlbiB0byBgaXRzYS5pbnN0YW5jZW9mKC4uLilgOiBcIit0eXBlO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBpbnN0YW5jZW9mQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKSA9PT0gdHlwZS5wcm90b3R5cGU7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiaW5zdGFuY2VvZiBjaGVjayBmYWlsZWQuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW50ZWdlckJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpbnRlZ2VyQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiXG4gICAgICAgICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlXG4gICAgICAgICYmIFtOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWV0uaW5kZXhPZih2YWwpID09PSAtMVxuICAgICAgICAmJiB2YWwgJSAxID09PSAwO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgaW50ZWdlclwiO1xuICB9O1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBqc29uQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGpzb25DaGVja2VyKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gXCJKU09OIG11c3QgYmUgYSBzdHJpbmcuXCI7XG4gICAgfVxuXG4gICAgdHJ5e1xuICAgICAgSlNPTi5wYXJzZSh2YWwpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgcmV0dXJuIFwiVmFsdWUgaXMgYSBub3QgdmFsaWQgSlNPTiBzdHJpbmcuXCI7XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGVuQnVpbGRlcihleGFjdE9yTWluLCBtYXgpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgdmFyIHZhbGlkYXRpb25UeXBlID0gXCJ0cnV0aHlcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB2YWxpZGF0aW9uVHlwZSA9IFwiZXhhY3RcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB2YWxpZGF0aW9uVHlwZSA9IFwiYmV0d2VlblwiO1xuXG4gIHJldHVybiBmdW5jdGlvbiBsZW5DaGVja2VyKHZhbCkge1xuICAgIHZhciBsZW5ndGggPSAodmFsIHx8ICh0eXBlb2YgdmFsKSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJ0cnV0aHlcIil7XG4gICAgICByZXR1cm4gbGVuZ3RoID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCB0cnV0aHkuXCI7XG4gICAgfWVsc2UgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcImV4YWN0XCIpe1xuICAgICAgcmV0dXJuIGxlbmd0aCA9PT0gZXhhY3RPck1pbiA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgZXhhY3RseTogXCIrZXhhY3RPck1pbjtcbiAgICB9ZWxzZSBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwiYmV0d2VlblwiKXtcbiAgICAgIHZhciB2YWxpZCA9IGxlbmd0aCA+PSBleGFjdE9yTWluICYmIGxlbmd0aCA8PSBtYXg7XG4gICAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJMZW5ndGggaXMgbm90IGJldHdlZW4gXCIrZXhhY3RPck1pbiArXCIgYW5kIFwiICsgbWF4O1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciByeCA9IC9bQS1aXS87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbG93ZXJjYXNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGxvd2VyY2FzZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIGNvbnRhaW5zIHVwcGVyY2FzZSBjaGFyYWN0ZXJzLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWF0Y2hlc0J1aWxkZXIocngpIHtcbiAgaWYgKHJ4IGluc3RhbmNlb2YgUmVnRXhwID09PSBmYWxzZSkge1xuICAgIHRocm93IFwiYC5tYXRjaGVzKC4uLilgIHJlcXVpcmVzIGEgcmVnZXhwXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gbWF0Y2hlc0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRvZXMgbm90IG1hdGNoIHJlZ2V4cC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWF4KSB7XG4gIGlmICh0eXBlb2YgbWF4ICE9IFwibnVtYmVyXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgbWF4aW11bSBpbiBtYXhMZW5ndGg6IFwiK21heDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPD0gbWF4O1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJtYXhMZW5ndGhcIiwgXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtYXggaXMgXCIrbWF4LCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWluTGVuZ3RoQnVpbGRlcihtaW4pIHtcbiAgaWYgKHR5cGVvZiBtaW4gIT0gXCJudW1iZXJcIikge1xuICAgIHRocm93IFwiSW52YWxpZCBtaW5pbXVtIGluIG1pbkxlbmd0aDogXCIrbWluO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBtaW5MZW5ndGhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPj0gbWluO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtaW5pbXVtIGlzIFwiK21pbik7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbmFuQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5hbkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGlzTmFOKHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgTmFOLlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vdEVtcHR5QnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5vdEVtcHR5Q2hlY2tlcih2YWwpIHtcblxuICAgIGlmIChoZWxwZXJzLmlzU3RyaW5nKHZhbCkpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoICE9PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgbm90IGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggIT09IDAgPyBudWxsIDogXCJDYW5ub3QgYmUgZW1wdHkuXCI7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICB2YXIgbnVtYmVyT2ZGaWVsZHMgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBpZiAoIXZhbC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgbnVtYmVyT2ZGaWVsZHMgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW1iZXJPZkZpZWxkcyAhPT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIG5vdCBlbXB0eSwgYnV0IG51bWJlciBvZiBmaWVsZHMgaXM6IFwiK251bWJlck9mRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBcIlR5cGUgY2Fubm90IGJlIG5vdC1lbXB0eTogXCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbnVsbEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBudWxsQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSBudWxsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IG51bGwuXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbnVtYmVyQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG51bWJlckNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gaGVscGVycy5pc1ZhbGlkTnVtYmVyKHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiSW52YWxpZCBudW1iZXJcIjtcbiAgfTtcbn07XG5cbiIsIlxudmFyIGhlbHBlcnMgPSByZXF1aXJlKFwiLi4vaGVscGVyc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSwgYWxsb3dFeHRyYUZpZWxkcykge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBhbGxvd0V4dHJhRmllbGRzID0gYWxsb3dFeHRyYUZpZWxkcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcblxuICAvKlxuICAgKiBUaGUgZXhhbXBsZSBpcyBhbiBvYmplY3Qgd2hlcmUgdGhlIGtleXMgYXJlIHRoZSBmaWVsZCBuYW1lc1xuICAgKiBhbmQgdGhlIHZhbHVlcyBhcmUgaXRzYSBpbnN0YW5jZXMuXG4gICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAgKi9cbiAgZm9yKHZhciBrZXkgaW4gZXhhbXBsZSkge1xuICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcbiAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGVba2V5XSk7XG4gICAgZXhhbXBsZVtrZXldID0gaXRzYUluc3RhbmNlO1xuICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICBpdHNhSW5zdGFuY2UuX2tleSA9IGtleTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNQbGFpbk9iamVjdCh2YWwpO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJvYmplY3RcIiwgXCJUeXBlIHdhczogXCIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCksIHZhbGlkKV1cbiAgICB9KTtcbiAgICBpZiAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICB9XG5cbiAgICAvL2V4dHJhIGZpZWxkcyBub3QgYWxsb3dlZD9cbiAgICBpZiAoYWxsb3dFeHRyYUZpZWxkcyA9PT0gZmFsc2UpIHtcbiAgICAgIHZhciBpbnZhbGlkRmllbGRzID0gW107XG4gICAgICBmb3IodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cbiAgICAgICAgaWYgKGtleSBpbiBleGFtcGxlID09PSBmYWxzZSkge1xuICAgICAgICAgIGludmFsaWRGaWVsZHMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaW52YWxpZEZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcIm9iamVjdFwiLCBcIlVuZXhwZWN0ZWQgZmllbGRzOiBcIitpbnZhbGlkRmllbGRzLmpvaW4oKSwgZmFsc2UpXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcih2YXIga2V5IGluIGV4YW1wbGUpIHtcbiAgICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcblxuICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IGV4YW1wbGVba2V5XTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxba2V5XTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtrZXldID0gbmV3VmFsOyB9O1xuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS5fdmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvdmVyQnVpbGRlcihtaW4sIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gb3ZlckNoZWNrZXIodmFsKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcmV0dXJuIHZhbCA+PSBtaW4gPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IG92ZXIgdGhlIG1pbmltdW0gKGluY2x1c2l2ZSkuXCI7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdmFsID4gbWluID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBvdmVyIHRoZSBtaW5pbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNSZWdFeHAodmFsKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwicmVnZXhwXCIsIHZhbGlkP1wiUmVnRXhwIHZlcmlmaWVkLlwiOlwiRXhwZWN0ZWQgYSBSZWdFeHAuXCIsIHZhbGlkKV0sXG4gICAgfTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdGFydHNXaXRoQnVpbGRlcih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gc3RhcnRzV2l0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5pbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgaWYgKCFoYXNJbmRleE9mKSB7XG4gICAgICByZXR1cm4gXCJEYXRhIGhhcyBubyBpbmRleE9mLCBzbyB0aGVyZSdzIG5vIHdheSB0byBjaGVjayBgLnN0YXJ0c1dpdGgoKWAuXCI7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHZhbC5pbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKXtcbiAgICAgIHJldHVybiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gICAgfVxuICAgIHJldHVybiBpbmRleCA9PT0gMCA/IG51bGwgOiBcIkRhdGEgY29udGFpbnMgdGhlIHZhbHVlLCBidXQgZG9lcyBub3Qgc3RhcnQgd2l0aCBpdC5cIjtcbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IGhlbHBlcnMuaXNTdHJpbmcodmFsKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwic3RyaW5nXCIsIHZhbGlkP1wiU3RyaW5nIGlkZW50aWZpZWQuXCI6XCJFeHBlY3RlZCBhIHN0cmluZy5cIiwgdmFsaWQpXVxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9CdWlsZGVyICh2YWx1ZU9yR2V0dGVyKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBkZWZhdWx0IHZhbHVlIHdhcyBnaXZlbiBpbiBgLnRvKC4uLilgLlwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHRvUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAudG8oLi4uKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIHNldHRlcih0eXBlb2YgdmFsdWVPckdldHRlciA9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZU9yR2V0dGVyKCkgOiB2YWx1ZU9yR2V0dGVyKTtcbiAgfTtcbn07IiwiXG52YXIgaGVscGVycyA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvRGF0ZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9EYXRlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9EYXRlKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIGlmICghdmFsKSB7XG4gICAgICByZXR1cm4gXCJVbndpbGxpbmcgdG8gcGFyc2UgZmFsc3kgdmFsdWVzLlwiO1xuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsKSkge1xuICAgICAgcmV0dXJuIFwiVW53aWxsaW5nIHRvIGNyZWF0ZSBkYXRlIGZyb20gYXJyYXlzLlwiO1xuICAgIH1cblxuICAgIHZhciBkYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICBpZiAoaXNGaW5pdGUoZGF0ZSkpIHtcbiAgICAgIHNldHRlcihkYXRlKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBcIlVuYWJsZSB0byBwYXJzZSBkYXRlLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9GbG9hdEJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9GbG9hdFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvRmxvYXQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBmbG9hdC5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9JbnRlZ2VyQnVpbGRlciAocmFkaXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSW50ZWdlclJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvSW50ZWdlcigpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBwYXJzZUludCh2YWwsIHR5cGVvZiByYWRpeCA9PT0gXCJ1bmRlZmluZWRcIiA/IDEwIDogcmFkaXgpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBpbnRlZ2VyLlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Mb3dlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTG93ZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9Mb3dlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvTm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b05vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLnRvTm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU3RyaW5nQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1N0cmluZ1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvU3RyaW5nKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IFN0cmluZyh2YWwpO1xuICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9UcmltbWVkQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1RyaW1tZWRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1RyaW1tZWQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50cmltKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9VcHBlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVXBwZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9VcHBlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydWVCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1ZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdHJ1ZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgdHJ1ZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cnV0aHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1dGh5Q2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHRydXRoeS5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHR5cGVvZkJ1aWxkZXIodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgIT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IFwiSW52YWxpZCB0eXBlIGdpdmVuIHRvIGBpdHNhLnR5cGVvZiguLi4pYDogXCIrdHlwZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gdHlwZW9mQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSB0eXBlO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJFeHBlY3RlZCB0eXBlIFwiK3R5cGUrXCIsIGJ1dCB0eXBlIGlzIFwiKyh0eXBlb2YgdmFsKSk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZWZpbmVkQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuZGVmaW5lZENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHVuZGVmaW5lZC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZGVyQnVpbGRlcihtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gdW5kZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCB1bmRlciB0aGUgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IHVuZGVyIHRoZSBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciBoZWxwZXJzID0gcmVxdWlyZShcIi4uL2hlbHBlcnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5pcXVlQnVpbGRlcihnZXR0ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuaXF1ZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgaXNUeXBlVmFsaWQgPSBoZWxwZXJzLmlzQXJyYXkodmFsKSB8fCBoZWxwZXJzLmlzUGxhaW5PYmplY3QodmFsKSB8fCBoZWxwZXJzLmlzU3RyaW5nKHZhbCk7XG4gICAgaWYgKCFpc1R5cGVWYWxpZCkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNoZWNrIHVuaXF1ZW5lc3Mgb24gdGhpcyB0eXBlIG9mIGRhdGEuXCI7XG4gICAgfVxuXG4gICAgdmFyIGdldHRlclR5cGUgPSBcIlwiO1xuICAgIGlmICh0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIpIHsgZ2V0dGVyVHlwZSA9IFwiZnVuY3Rpb25cIjsgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBnZXR0ZXIgIT09IFwidW5kZWZpbmVkXCIpIHsgZ2V0dGVyVHlwZSA9IFwicGx1Y2tcIjsgfVxuXG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgaWYgKCF2YWwuaGFzT3duUHJvcGVydHkoa2V5KSkgeyBjb250aW51ZTsgfVxuXG4gICAgICB2YXIgaXRlbSA9IHZhbFtrZXldO1xuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpdGVtID0gZ2V0dGVyKGl0ZW0pO1xuICAgICAgfVxuICAgICAgaWYgKGdldHRlclR5cGUgPT09IFwicGx1Y2tcIikge1xuICAgICAgICBpdGVtID0gaXRlbVtnZXR0ZXJdO1xuICAgICAgfVxuICAgICAgdmFyIGFscmVhZHlGb3VuZCA9IGl0ZW1zLmluZGV4T2YoaXRlbSkgPiAtMTtcbiAgICAgIGlmIChhbHJlYWR5Rm91bmQpIHtcbiAgICAgICAgcmV0dXJuIFwiSXRlbXMgYXJlIG5vdCB1bmlxdWUuXCI7XG4gICAgICB9XG4gICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn07XG5cbiIsIlxudmFyIHJ4ID0gL1thLXpdLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1cHBlcmNhc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdXBwZXJjYXNlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiICYmICFyeC50ZXN0KHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgY29udGFpbnMgbG93ZXJjYXNlIGNoYXJhY3RlcnMuXCI7XG4gIH07XG59O1xuXG4iXX0=
