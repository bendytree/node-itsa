/*! 
  * @license 
  * itsa 1.1.19 <https://github.com/bendytree/node-itsa> 
  * Copyright 01/30/2015 Josh Wright <http://www.joshwright.com> 
  * MIT LICENSE <https://github.com/bendytree/node-itsa/blob/master/LICENSE> 
  */ 
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.itsa=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = require("./lib/itsa");

},{"./lib/itsa":3}],2:[function(require,module,exports){

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

},{"./aliases":2,"./methods/alias":4,"./methods/build-final-result":5,"./methods/build-log":6,"./methods/combine-results":7,"./methods/convert-validator-to-itsa-instance":8,"./methods/extend":9,"./methods/msg":10,"./methods/validate":11,"./validators":30}],4:[function(require,module,exports){



module.exports = function alias(oldName, newName) {
  this[newName] = this.prototype[newName] = function(){
    return this[oldName].apply(this, arguments);
  }
};

},{}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){


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

},{}],7:[function(require,module,exports){


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
},{}],8:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){

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

},{}],10:[function(require,module,exports){


module.exports = function msg(msg) {
  if (typeof msg !== "string" || !msg) {
    throw ".msg(...) must be given an error message";
  }

  this.errorMessages[this.validators[this.validators.length-1]] = msg;

  return this;
};

},{}],11:[function(require,module,exports){



module.exports = function (getter, setter) {
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
  if (Object.prototype.toString.call(result) === "[object Object]") {
    return result;
  }

  //otherwise interpret it as string=error
  var valid = typeof result !== "string" || !result;
  return {
    valid: valid,
    logs: [itsaInstance._buildLog("function", valid?"Validation succeeded":result, valid)]
  };
};
},{}],12:[function(require,module,exports){

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


},{}],13:[function(require,module,exports){

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


},{}],14:[function(require,module,exports){


module.exports = function (example, allowExtraItems) {
  //example is missing or an array
  var args = [].concat.apply([].slice.call(arguments));
  allowExtraItems = allowExtraItems || args.length === 0;
  if (args.length > 0) {
    var isExampleArray = Object.prototype.toString.call(example) === "[object Array]";
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
    var prototypeStr = Object.prototype.toString.call(val);
    var valid = prototypeStr === "[object Array]";
    results.push({
      valid: valid,
      logs: [this._buildLog("array", "Type was :"+prototypeStr, valid)]
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
      var result = itsaInstance.validate.apply(itsaInstance, [getter, setter]);
      results.push(result);
    }

    return this._combineResults(results);
  };
};

},{}],15:[function(require,module,exports){


module.exports = function (example) {
  var args = [].concat.apply([].slice.call(arguments));
  var doValidateItems = args.length > 0;

  return function(val){

    var results = [];

    // typeof [], null, etc are object, so use this check for actual objects
    var prototypeStr = Object.prototype.toString.call(val);
    var valid = prototypeStr === "[object Array]";
    results.push({
      valid: valid,
      logs: [this._buildLog("array", "Type was :"+prototypeStr, valid)]
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
        var result = itsaInstance.validate.apply(itsaInstance, [getter, setter]);
        results.push(result);
      }
    }

    return this._combineResults(results);
  };
};

},{}],16:[function(require,module,exports){


module.exports = function betweenBuilder(min, max, inclusive) {
  return function betweenChecker(val) {
    if (inclusive) {
      return val >= min && val <= max ? null : "Value was not between minimum and maximum (inclusive).";
    }else{
      return val > min && val < max ? null : "Value was not between minimum and maximum (exclusive).";
    }
  };
};

},{}],17:[function(require,module,exports){


module.exports = function booleanBuilder() {
  return function booleanChecker(val) {
    var valid = typeof val === "boolean";
    return valid ? null : "Value is not a boolean.";
  };
};

},{}],18:[function(require,module,exports){


module.exports = function containsBuilder(value) {
  return function containsChecker(val) {
    var hasIndexOf = (val && val.indexOf) || (typeof val === "string");
    var valid = hasIndexOf && val.indexOf(value) > -1;
    return valid ? null : "Data does not contain the value.";
  };
};

},{}],19:[function(require,module,exports){


module.exports = function customBuilder(validatorFunction) {
  if (arguments.length === 0){
    throw "No validatorFunction given in itsa.custom(...)";
  }

  return validatorFunction.bind(this);
};

},{}],20:[function(require,module,exports){


module.exports = function dateBuilder() {
  return function dateChecker(val) {
    var classType = Object.prototype.toString.call(val);
    var valid = classType === "[object Date]" && isFinite(val);
    return valid ? null : "Invalid date";
  };
};


},{}],21:[function(require,module,exports){


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
},{}],22:[function(require,module,exports){


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
},{}],23:[function(require,module,exports){

var rx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

module.exports = function emailBuilder() {
  return function emailChecker(val) {
    return rx.test(val) ? null : "Value is not an email address.";
  };
};


},{}],24:[function(require,module,exports){


module.exports = function emptyBuilder() {
  return function emptyChecker(val) {
    var classType = Object.prototype.toString.call(val);

    if (classType === "[object String]") {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (classType === "[object Array]") {
      return val.length === 0 ? null : "Expected empty, but length is: "+val.length;
    }

    if (classType === "[object Object]") {
      var numberOfFields = 0;
      for (var key in val) {
        numberOfFields += 1;
      }
      return numberOfFields === 0 ? null : "Expected empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be empty: "+classType;
  };
};

},{}],25:[function(require,module,exports){


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

},{}],26:[function(require,module,exports){


module.exports = function equalBuilder(example) {
  if (arguments.length === 0){
    throw "No comparison object given in itsa.equal(...)";
  }

  return function equalChecker(val) {
    var valid = example === val;
    return valid ? null : "Value did not pass equality test.";
  };
};

},{}],27:[function(require,module,exports){


module.exports = function falseBuilder() {
  return function falseChecker(val) {
    return val === false ? null : "Value is not `false`.";
  };
};


},{}],28:[function(require,module,exports){


module.exports = function falsyBuilder() {
  return function falsyChecker(val) {
    return !val ? null : "Value is not falsy.";
  };
};


},{}],29:[function(require,module,exports){

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


},{}],30:[function(require,module,exports){

module.exports = {
  "alphanumeric": require('./alphanumeric'),
  "any": require('./any'),
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
  "undefined": require('./undefined'),
  "under": require('./under'),
  "unique": require('./unique'),
  "uppercase": require('./uppercase')
};

},{"./alphanumeric":12,"./any":13,"./array":14,"./arrayOf":15,"./between":16,"./boolean":17,"./contains":18,"./custom":19,"./date":20,"./default":21,"./defaultNow":22,"./email":23,"./empty":24,"./endsWith":25,"./equal":26,"./false":27,"./falsy":28,"./hex":29,"./integer":31,"./json":32,"./len":33,"./lowercase":34,"./matches":35,"./maxLength":36,"./minLength":37,"./nan":38,"./notEmpty":39,"./null":40,"./number":41,"./object":42,"./over":43,"./startsWith":44,"./string":45,"./to":46,"./toDate":47,"./toFloat":48,"./toInteger":49,"./toLowercase":50,"./toNow":51,"./toString":52,"./toTrimmed":53,"./toUppercase":54,"./true":55,"./truthy":56,"./undefined":57,"./under":58,"./unique":59,"./uppercase":60}],31:[function(require,module,exports){


module.exports = function integerBuilder() {
  return function integerChecker(val) {
    var valid = typeof val === "number"
        && isNaN(val) === false
        && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
        && val % 1 === 0;
    return valid ? null : "Invalid integer";
  };
};

},{}],32:[function(require,module,exports){

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


},{}],33:[function(require,module,exports){


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

},{}],34:[function(require,module,exports){

var rx = /[A-Z]/;

module.exports = function lowercaseBuilder() {
  return function lowercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains uppercase characters.";
  };
};


},{}],35:[function(require,module,exports){


module.exports = function matchesBuilder(rx) {
  if (rx instanceof RegExp === false) {
    throw "`.matches(...)` requires a regexp";
  }

  return function matchesChecker(val) {
    var valid = rx.test(val);
    return valid ? null : "Value does not match regexp.";
  };
};

},{}],36:[function(require,module,exports){


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

},{}],37:[function(require,module,exports){


module.exports = function minLengthBuilder(min) {
  if (typeof min != "number") {
    throw "Invalid minimum in minLength: "+min;
  }
  return function minLengthChecker(val) {
    var type = typeof val;
    var length = (val || type === "string") ? val.length : undefined;
    var valid = typeof length === "number" && length >= min;
    return valid ? null : ("Length is "+length+", min is "+min);
  };
};

},{}],38:[function(require,module,exports){


module.exports = function nanBuilder() {
  return function nanChecker(val) {
    return isNaN(val) ? null : "Value is not NaN.";
  };
};


},{}],39:[function(require,module,exports){


module.exports = function notEmptyBuilder() {
  return function notEmptyChecker(val) {
    var classType = Object.prototype.toString.call(val);

    if (classType === "[object String]") {
      return val.length !== 0 ? null : "Expected not empty, but length is: "+val.length;
    }

    if (classType === "[object Array]") {
      return val.length !== 0 ? null : "Expected not empty, but length is: "+val.length;
    }

    if (classType === "[object Object]") {
      var numberOfFields = 0;
      for (var key in val) {
        numberOfFields += 1;
      }
      return numberOfFields !== 0 ? null : "Expected not empty, but number of fields is: "+numberOfFields;
    }

    return "Type cannot be not-empty: "+classType;
  };
};

},{}],40:[function(require,module,exports){


module.exports = function nullBuilder() {
  return function nullChecker(val) {
    return val === null ? null : "Value is not null.";
  };
};


},{}],41:[function(require,module,exports){


module.exports = function numberBuilder() {
  return function numberChecker(val) {
    var valid = typeof val === "number"
      && isNaN(val) === false
      && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1;
    return valid ? null : "Invalid number";
  };
};


},{}],42:[function(require,module,exports){


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
    var prototypeStr = Object.prototype.toString.call(val);
    var valid = prototypeStr === "[object Object]";
    results.push({
      valid: valid,
      logs: [this._buildLog("object", "Type was: "+prototypeStr, valid)]
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
      var result = itsaInstance.validate.apply(itsaInstance, [getter, setter]);
      results.push(result);
    }

    return this._combineResults(results);
  };
};

},{}],43:[function(require,module,exports){


module.exports = function overBuilder(min, inclusive) {
  return function overChecker(val) {
    if (inclusive) {
      return val >= min ? null : "Value was not over the minimum (inclusive).";
    }else{
      return val > min ? null : "Value was not over the minimum (exclusive).";
    }
  };
};

},{}],44:[function(require,module,exports){


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

},{}],45:[function(require,module,exports){


module.exports = function () {
  return function (val) {
    var type = typeof val;
    var valid = type === "string";
    return {
      valid: valid,
      logs: [this._buildLog("string", "Expected a string, but found a "+type, valid)],
    };
  };
};

},{}],46:[function(require,module,exports){


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
},{}],47:[function(require,module,exports){

module.exports = function toDateBuilder () {
  return function toDateRunner (val, setter) {
    if (!setter) throw "`.toDate()` may not be used unless it is within an object or array.";

    if (!val) {
      return "Unwilling to parse falsy values.";
    }

    if (Object.prototype.toString.call(val) === "[object Array]") {
      return "Unwilling to parse arrays.";
    }

    var date = new Date(val);
    if (isFinite(date)) {
      setter(date);
    }else{
      return "Unable to parse date.";
    }
  };
};

},{}],48:[function(require,module,exports){

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

},{}],49:[function(require,module,exports){


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
},{}],50:[function(require,module,exports){


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
},{}],51:[function(require,module,exports){


module.exports = function toNowBuilder () {
  return function toNowRunner (val, setter) {
    if (!setter) {
      throw "`.toNow()` may not be used unless it is within an object or array.";
    }

    setter(new Date());
  };
};
},{}],52:[function(require,module,exports){


module.exports = function toStringBuilder () {
  return function toStringRunner (val, setter) {
    if (!setter) throw "`.toString()` may not be used unless it is within an object or array.";

    var newValue = String(val);
    if (val !== newValue) {
      setter(newValue);
    }
  };
};
},{}],53:[function(require,module,exports){


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
},{}],54:[function(require,module,exports){


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
},{}],55:[function(require,module,exports){


module.exports = function trueBuilder() {
  return function trueChecker(val) {
    return val === true ? null : "Value is not `true`.";
  };
};


},{}],56:[function(require,module,exports){


module.exports = function truthyBuilder() {
  return function truthyChecker(val) {
    return val ? null : "Value is not truthy.";
  };
};


},{}],57:[function(require,module,exports){


module.exports = function undefinedBuilder() {
  return function undefinedChecker(val) {
    return val === undefined ? null : "Value is not undefined.";
  };
};


},{}],58:[function(require,module,exports){


module.exports = function underBuilder(max, inclusive) {
  return function underChecker(val) {
    if (inclusive) {
      return val <= max ? null : "Value was not under the maximum (inclusive).";
    }else{
      return val < max ? null : "Value was not under the maximum (exclusive).";
    }
  };
};

},{}],59:[function(require,module,exports){


module.exports = function uniqueBuilder(getter) {
  return function uniqueChecker(val) {
    var type = Object.prototype.toString.call(val);
    var validTypes = ["[object Array]", "[object Object]", "[object String]"];
    var isTypeValid = validTypes.indexOf(type) > -1;
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


},{}],60:[function(require,module,exports){

var rx = /[a-z]/;

module.exports = function uppercaseBuilder() {
  return function uppercaseChecker(val) {
    var valid = typeof val === "string" && !rx.test(val);
    return valid ? null : "Value is contains lowercase characters.";
  };
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2l0c2EuanMiLCJsaWIvbWV0aG9kcy9hbGlhcy5qcyIsImxpYi9tZXRob2RzL2J1aWxkLWZpbmFsLXJlc3VsdC5qcyIsImxpYi9tZXRob2RzL2J1aWxkLWxvZy5qcyIsImxpYi9tZXRob2RzL2NvbWJpbmUtcmVzdWx0cy5qcyIsImxpYi9tZXRob2RzL2NvbnZlcnQtdmFsaWRhdG9yLXRvLWl0c2EtaW5zdGFuY2UuanMiLCJsaWIvbWV0aG9kcy9leHRlbmQuanMiLCJsaWIvbWV0aG9kcy9tc2cuanMiLCJsaWIvbWV0aG9kcy92YWxpZGF0ZS5qcyIsImxpYi92YWxpZGF0b3JzL2FscGhhbnVtZXJpYy5qcyIsImxpYi92YWxpZGF0b3JzL2FueS5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9oZXguanMiLCJsaWIvdmFsaWRhdG9ycy9pbmRleC5qcyIsImxpYi92YWxpZGF0b3JzL2ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9qc29uLmpzIiwibGliL3ZhbGlkYXRvcnMvbGVuLmpzIiwibGliL3ZhbGlkYXRvcnMvbG93ZXJjYXNlLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF0Y2hlcy5qcyIsImxpYi92YWxpZGF0b3JzL21heExlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL21pbkxlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL25hbi5qcyIsImxpYi92YWxpZGF0b3JzL25vdEVtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvbnVsbC5qcyIsImxpYi92YWxpZGF0b3JzL251bWJlci5qcyIsImxpYi92YWxpZGF0b3JzL29iamVjdC5qcyIsImxpYi92YWxpZGF0b3JzL292ZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9zdGFydHNXaXRoLmpzIiwibGliL3ZhbGlkYXRvcnMvc3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG8uanMiLCJsaWIvdmFsaWRhdG9ycy90b0RhdGUuanMiLCJsaWIvdmFsaWRhdG9ycy90b0Zsb2F0LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9JbnRlZ2VyLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9Mb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90b05vdy5qcyIsImxpYi92YWxpZGF0b3JzL3RvU3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9UcmltbWVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9VcHBlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90cnVlLmpzIiwibGliL3ZhbGlkYXRvcnMvdHJ1dGh5LmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZWZpbmVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZXIuanMiLCJsaWIvdmFsaWRhdG9ycy91bmlxdWUuanMiLCJsaWIvdmFsaWRhdG9ycy91cHBlcmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2l0c2FcIik7XG4iLCJcbi8qKlxuICogQSBsaXN0IG9mIGJ1aWx0IGluIGFsaWFzZXMgZm9yIGl0c2EgdmFsaWRhdG9ycy5cbiAqXG4gKiB7IFwiYWxpYXNOYW1lXCIgOiBcInJlYWxOYW1lXCIgfVxuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJhZnRlclwiOiBcIm92ZXJcIixcbiAgXCJiZWZvcmVcIjogXCJ1bmRlclwiXG59O1xuIiwiXG52YXIgaXRzYSA9IGZ1bmN0aW9uICgpIHtcbiAgLy9mb3JjZSBgbmV3YFxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgaXRzYSkpIHsgcmV0dXJuIG5ldyBpdHNhKCk7IH1cblxuICB0aGlzLnZhbGlkYXRvcnMgPSBbXTtcbiAgdGhpcy5lcnJvck1lc3NhZ2VzID0ge307XG59O1xuXG4vLyBQcml2YXRlXG5pdHNhLnByb3RvdHlwZS5fYnVpbGRMb2cgPSByZXF1aXJlKFwiLi9tZXRob2RzL2J1aWxkLWxvZ1wiKTtcbml0c2EucHJvdG90eXBlLl9idWlsZEZpbmFsUmVzdWx0ID0gcmVxdWlyZShcIi4vbWV0aG9kcy9idWlsZC1maW5hbC1yZXN1bHRcIik7XG5pdHNhLnByb3RvdHlwZS5fY29tYmluZVJlc3VsdHMgPSByZXF1aXJlKFwiLi9tZXRob2RzL2NvbWJpbmUtcmVzdWx0c1wiKTtcbml0c2EucHJvdG90eXBlLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UgPSByZXF1aXJlKFwiLi9tZXRob2RzL2NvbnZlcnQtdmFsaWRhdG9yLXRvLWl0c2EtaW5zdGFuY2VcIik7XG5pdHNhLnByb3RvdHlwZS5faXRzYSA9IGl0c2E7XG5cbi8vIFB1YmxpY1xuaXRzYS5wcm90b3R5cGUudmFsaWRhdGUgPSByZXF1aXJlKFwiLi9tZXRob2RzL3ZhbGlkYXRlXCIpO1xuaXRzYS5wcm90b3R5cGUubXNnID0gcmVxdWlyZShcIi4vbWV0aG9kcy9tc2dcIik7XG5pdHNhLmV4dGVuZCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvZXh0ZW5kXCIpO1xuaXRzYS5hbGlhcyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYWxpYXNcIik7XG5cbi8vIEJ1aWx0IGluIHZhbGlkYXRvcnNcbml0c2EuZXh0ZW5kKHJlcXVpcmUoXCIuL3ZhbGlkYXRvcnNcIikpO1xuXG4vLyBBZGQgYWxpYXNlc1xudmFyIGFsaWFzZXMgPSByZXF1aXJlKFwiLi9hbGlhc2VzXCIpO1xuZm9yICh2YXIga2V5IGluIGFsaWFzZXMpe1xuICBpdHNhLmFsaWFzKGFsaWFzZXNba2V5XSwga2V5KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0c2E7XG4iLCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFsaWFzKG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgdGhpc1tuZXdOYW1lXSA9IHRoaXMucHJvdG90eXBlW25ld05hbWVdID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpc1tvbGROYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG59O1xuIiwiXG52YXIgRmluYWxSZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHRoaXMudmFsaWQgPSByZXN1bHQudmFsaWQ7XG4gIHRoaXMubG9ncyA9IHJlc3VsdC5sb2dzO1xufTtcblxuRmluYWxSZXN1bHQucHJvdG90eXBlLmRlc2NyaWJlID0gZnVuY3Rpb24gKCkge1xuICAvL3ZhbGlkPyBjb29sIHN0b3J5IGJyb1xuICBpZiAodGhpcy52YWxpZCkge1xuICAgIHJldHVybiBcIlZhbGlkYXRpb24gc3VjY2VlZGVkLlwiO1xuICB9XG5cbiAgLy9pbnZhbGlkXG4gIHZhciBtZXNzYWdlcyA9IFtdO1xuICBmb3IgKHZhciBpIGluIHRoaXMubG9ncyl7XG4gICAgdmFyIGxvZyA9IHRoaXMubG9nc1tpXTtcbiAgICBpZiAobG9nLnZhbGlkKSBjb250aW51ZTtcbiAgICBpZiAobG9nLmN1c3RvbU1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2gobG9nLmN1c3RvbU1lc3NhZ2UpO1xuICAgIH1lbHNle1xuICAgICAgbWVzc2FnZXMucHVzaCgobG9nLnBhdGggPyAobG9nLnBhdGggKyBcIjogXCIpIDogXCJcIikgKyBsb2cubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1lc3NhZ2VzLmpvaW4oXCJcXG5cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgcmV0dXJuIG5ldyBGaW5hbFJlc3VsdChyZXN1bHQpO1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWxpZGF0b3IsIG1zZywgdmFsaWQpIHtcbiAgdmFyIHBhdGhzID0gW107XG4gIHZhciBub2RlID0gdGhpcztcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZS5fa2V5KSB7XG4gICAgcGF0aHMuc3BsaWNlKDAsIDAsIG5vZGUuX2tleSk7XG4gICAgbm9kZSA9IG5vZGUuX3BhcmVudDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWxpZCxcbiAgICBwYXRoOiBwYXRocy5qb2luKFwiLlwiKSxcbiAgICB2YWxpZGF0b3I6IHZhbGlkYXRvcixcbiAgICBtZXNzYWdlOiBtc2csXG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgLy9vbmUgcmVzdWx0PyBzaG9ydGN1dFxuICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgfVxuXG4gIHZhciB2YWxpZCA9IHRydWU7XG4gIHZhciBsb2dzID0gW107XG5cbiAgZm9yICh2YXIgaSBpbiByZXN1bHRzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHJlc3VsdHNbaV07XG4gICAgdmFsaWQgPSB2YWxpZCAmJiByZXN1bHQudmFsaWQ7XG5cbiAgICBpZiAocmVzdWx0LmxvZ3MgJiYgcmVzdWx0LmxvZ3MubGVuZ3RoKSB7XG4gICAgICBsb2dzLnB1c2guYXBwbHkobG9ncywgcmVzdWx0LmxvZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IHZhbGlkOiB2YWxpZCwgbG9nczogbG9ncyB9O1xufTsiLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbGlkYXRvcikge1xuICAvL2FscmVhZHkgYW4gYGl0c2FgIGluc3RhbmNlP1xuICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PT0gXCJvYmplY3RcIiAmJiB2YWxpZGF0b3IgaW5zdGFuY2VvZiB0aGlzLl9pdHNhKSB7XG4gICAgcmV0dXJuIHZhbGlkYXRvcjtcbiAgfVxuXG4gIC8vbm90IGFuIGluc3RhbmNlIHlldCwgc28gY3JlYXRlIG9uZVxuICB2YXIgaW5zdGFuY2UgPSBuZXcgdGhpcy5faXRzYSgpO1xuICBpbnN0YW5jZS52YWxpZGF0b3JzLnB1c2godmFsaWRhdG9yKTtcbiAgcmV0dXJuIGluc3RhbmNlO1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoZXh0ZW5zaW9ucykge1xuICBmb3IgKHZhciBuYW1lIGluIGV4dGVuc2lvbnMpIHtcbiAgICAvL2lnbm9yZSBpbmhlcml0ZWQgcHJvcGVydGllc1xuICAgIGlmICghZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgeyBjb250aW51ZTsgfVxuXG4gICAgYXNzaWduKHRoaXMsIG5hbWUsIGV4dGVuc2lvbnNbbmFtZV0pO1xuICB9XG59O1xuXG52YXIgYXNzaWduID0gZnVuY3Rpb24gKGl0c2EsIG5hbWUsIGJ1aWxkZXIpIHtcblxuICAvKipcbiAgICogQWxsb3dzIHN0YXRpYyBhY2Nlc3MgLSBsaWtlIGBpdHNhLnN0cmluZygpYFxuICAgKi9cbiAgaXRzYVtuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgaXRzYSgpO1xuICAgIGluc3RhbmNlLnZhbGlkYXRvcnMgPSBbYnVpbGRlci5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKV07XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBbGxvd3MgY2hhaW5pbmcgLSBsaWtlIGBpdHNhLnNvbWV0aGluZygpLnN0cmluZygpYFxuICAgKi9cbiAgaXRzYS5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWxpZGF0b3JzLnB1c2goYnVpbGRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1zZyhtc2cpIHtcbiAgaWYgKHR5cGVvZiBtc2cgIT09IFwic3RyaW5nXCIgfHwgIW1zZykge1xuICAgIHRocm93IFwiLm1zZyguLi4pIG11c3QgYmUgZ2l2ZW4gYW4gZXJyb3IgbWVzc2FnZVwiO1xuICB9XG5cbiAgdGhpcy5lcnJvck1lc3NhZ2VzW3RoaXMudmFsaWRhdG9yc1t0aGlzLnZhbGlkYXRvcnMubGVuZ3RoLTFdXSA9IG1zZztcblxuICByZXR1cm4gdGhpcztcbn07XG4iLCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChnZXR0ZXIsIHNldHRlcikge1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuICBmb3IgKHZhciBpIGluIHRoaXMudmFsaWRhdG9ycykge1xuICAgIHZhciB2YWxpZGF0b3IgPSB0aGlzLnZhbGlkYXRvcnNbaV07XG5cbiAgICAvL2dldCByZXN1bHRcbiAgICB2YXIgcmVzdWx0ID0gcnVuVmFsaWRhdG9yKHRoaXMsIHZhbGlkYXRvciwgZ2V0dGVyLCBzZXR0ZXIpO1xuXG4gICAgLy9pbnRlcnByZXQgcmVzdWx0XG4gICAgcmVzdWx0ID0gaW50ZXJwcmV0UmVzdWx0KHRoaXMsIHJlc3VsdCk7XG5cbiAgICAvL2N1c3RvbSBlcnJvclxuICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlICYmIHRoaXMuZXJyb3JNZXNzYWdlc1t2YWxpZGF0b3JdKXtcbiAgICAgIHJlc3VsdC5sb2dzWzBdLmN1c3RvbU1lc3NhZ2UgPSB0aGlzLmVycm9yTWVzc2FnZXNbdmFsaWRhdG9yXTtcbiAgICB9XG5cbiAgICAvL2FkZCBpdCB0byBsaXN0IG9mIHJlc3VsdHNcbiAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcblxuICAgIC8vaW52YWxpZD8gc2hvcnQgY2lyY3VpdFxuICAgIGlmIChyZXN1bHQudmFsaWQgPT09IGZhbHNlKSB7IGJyZWFrOyB9XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2J1aWxkRmluYWxSZXN1bHQodGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cykpO1xufTtcblxudmFyIHJ1blZhbGlkYXRvciA9IGZ1bmN0aW9uIChpdHNhSW5zdGFuY2UsIHZhbGlkYXRvciwgZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgdHJ5e1xuICAgIC8vYWxyZWFkeSBhbiBpdHNhIGluc3RhbmNlPyBqdXN0IHJ1biB2YWxpZGF0ZVxuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcIm9iamVjdFwiICYmIHZhbGlkYXRvciBpbnN0YW5jZW9mIGl0c2FJbnN0YW5jZS5faXRzYSkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRvci52YWxpZGF0ZShnZXR0ZXIsIHNldHRlcik7XG4gICAgfVxuXG4gICAgLy90aW1lIHRvIGdldCB0aGUgcmVhbCB2YWx1ZSAoY291bGQgYmUgYSB2YWx1ZSBvciBhIGZ1bmN0aW9uKVxuICAgIHZhciB2YWwgPSB0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIgPyBnZXR0ZXIoKSA6IGdldHRlcjtcblxuICAgIC8vYSBmdW5jdGlvbj8ganVzdCBydW4gdGhlIGZ1bmN0aW9uIHdpdGggdGhlIHZhbHVlXG4gICAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICByZXR1cm4gdmFsaWRhdG9yLmNhbGwoaXRzYUluc3RhbmNlLCB2YWwsIHNldHRlcik7XG4gICAgfVxuXG4gICAgLy9zb21ldGhpbmcgZWxzZSwgc28gdGhpcyBpcyBhID09PSBjaGVja1xuICAgIHJldHVybiB2YWwgPT09IHZhbGlkYXRvcjtcbiAgfWNhdGNoKGUpe1xuICAgIHJldHVybiBcIlVuaGFuZGxlZCBlcnJvci4gXCIrU3RyaW5nKGUpO1xuICB9XG59O1xuXG52YXIgaW50ZXJwcmV0UmVzdWx0ID0gZnVuY3Rpb24gKGl0c2FJbnN0YW5jZSwgcmVzdWx0KSB7XG4gIC8vcmVzdWx0IGlzIGEgYm9vbGVhbj9cbiAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiByZXN1bHQsXG4gICAgICBsb2dzOiBbaXRzYUluc3RhbmNlLl9idWlsZExvZyhcImZ1bmN0aW9uXCIsIHJlc3VsdD9cIlZhbGlkYXRpb24gc3VjY2VlZGVkXCI6XCJWYWxpZGF0aW9uIGZhaWxlZFwiLCByZXN1bHQpXVxuICAgIH07XG4gIH1cblxuICAvL3Jlc3VsdCBpcyBhbiBvYmplY3Q/XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmVzdWx0KSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvL290aGVyd2lzZSBpbnRlcnByZXQgaXQgYXMgc3RyaW5nPWVycm9yXG4gIHZhciB2YWxpZCA9IHR5cGVvZiByZXN1bHQgIT09IFwic3RyaW5nXCIgfHwgIXJlc3VsdDtcbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgbG9nczogW2l0c2FJbnN0YW5jZS5fYnVpbGRMb2coXCJmdW5jdGlvblwiLCB2YWxpZD9cIlZhbGlkYXRpb24gc3VjY2VlZGVkXCI6cmVzdWx0LCB2YWxpZCldXG4gIH07XG59OyIsIlxudmFyIHJ4ID0gL15bMC05YS16XSokL2k7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYWxwaGFudW1lcmljQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGFscGhhbnVtZXJpY0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIGlmIChbXCJzdHJpbmdcIiwgXCJudW1iZXJcIl0uaW5kZXhPZih0eXBlKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBcIlZhbHVlIHNob3VsZCBiZSBhbHBoYW51bWVyaWMsIGJ1dCBpc24ndCBhIHN0cmluZyBvciBudW1iZXIuXCI7XG4gICAgfVxuICAgIHJldHVybiByeC50ZXN0KHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgYWxwaGFudW1lcmljLlwiO1xuICB9O1xufTtcblxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFueUJ1aWxkZXIoKSB7XG4gIC8vY29tYmluZSB2YWxpZGF0b3JzXG4gIHZhciB2YWxpZGF0b3JzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmICh2YWxpZGF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IFwiTm8gdmFsaWRhdG9ycyBnaXZlbiBpbiBpdHNhLmFueSgpXCI7XG4gIH1cblxuICAvL2NvbnZlcnQgYWxsIHZhbGlkYXRvcnMgdG8gcmVhbCBpdHNhIGluc3RhbmNlc1xuICBmb3IodmFyIGkgaW4gdmFsaWRhdG9ycykge1xuICAgIHZhbGlkYXRvcnNbaV0gPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UodmFsaWRhdG9yc1tpXSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gYW55Q2hlY2tlcih2YWwpIHtcbiAgICAvL2ZpbmQgdGhlIGZpcnN0IHZhbGlkIG1hdGNoXG4gICAgdmFyIHZhbGlkUmVzdWx0ID0gbnVsbDtcbiAgICBmb3IodmFyIGkgaW4gdmFsaWRhdG9ycykge1xuICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IHZhbGlkYXRvcnNbaV07XG5cbiAgICAgIC8vc2V0IHNhbWUgY29udGV4dCBvbiBjaGlsZHJlblxuICAgICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzLl9wYXJlbnQ7XG4gICAgICBpdHNhSW5zdGFuY2UuX2tleSA9IHRoaXMuX2tleTtcblxuICAgICAgLy9leGVjdXRlIHZhbGlkYXRvciAmIHN0b3AgaWYgdmFsaWRcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UudmFsaWRhdGUodmFsKTtcbiAgICAgIGlmIChyZXN1bHQudmFsaWQpIHtcbiAgICAgICAgdmFsaWRSZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vc2VuZCBiYWNrIHRoZSByZXN1bHRcbiAgICBpZiAodmFsaWRSZXN1bHQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhbXG4gICAgICAgIHtcbiAgICAgICAgICB2YWxpZDogdHJ1ZSxcbiAgICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJhbnlcIiwgXCJNYXRjaCBmb3VuZC5cIiwgdHJ1ZSldXG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkUmVzdWx0XG4gICAgICBdKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYW55XCIsIFwiTm8gbWF0Y2hlcyBmb3VuZC5cIiwgZmFsc2UpXVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSwgYWxsb3dFeHRyYUl0ZW1zKSB7XG4gIC8vZXhhbXBsZSBpcyBtaXNzaW5nIG9yIGFuIGFycmF5XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGFsbG93RXh0cmFJdGVtcyA9IGFsbG93RXh0cmFJdGVtcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcbiAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBpc0V4YW1wbGVBcnJheSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleGFtcGxlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgIGlmICghaXNFeGFtcGxlQXJyYXkpIHtcbiAgICAgIHRocm93IFwiaW4gYC5hcnJheShleGFtcGxlKWAsIGV4YW1wbGUgbXVzdCBiZSBvbWl0dGVkIG9yIGFuIGFycmF5XCI7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgKiBUaGUgZXhhbXBsZSBpcyBhbiBhcnJheSB3aGVyZSBlYWNoIGl0ZW0gaXMgYSB2YWxpZGF0b3IuXG4gICogQXNzaWduIHBhcmVudCBpbnN0YW5jZSBhbmQga2V5XG4gICovXG4gIGZvcih2YXIgaSBpbiBleGFtcGxlKSB7XG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2ldKTtcbiAgICBleGFtcGxlW2ldID0gaXRzYUluc3RhbmNlO1xuICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciBwcm90b3R5cGVTdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgdmFsaWQgPSBwcm90b3R5cGVTdHIgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJUeXBlIHdhcyA6XCIrcHJvdG90eXBlU3RyLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy90b28gbWFueSBpdGVtcyBpbiBhcnJheT9cbiAgICBpZiAoYWxsb3dFeHRyYUl0ZW1zID09PSBmYWxzZSAmJiB2YWwubGVuZ3RoID4gZXhhbXBsZS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJFeGFtcGxlIGhhcyBcIitleGFtcGxlLmxlbmd0aCtcIiBpdGVtcywgYnV0IGRhdGEgaGFzIFwiK3ZhbC5sZW5ndGgsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yKHZhciBpIGluIGV4YW1wbGUpIHtcbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2ldO1xuICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtpXSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UudmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICB2YXIgZG9WYWxpZGF0ZUl0ZW1zID0gYXJncy5sZW5ndGggPiAwO1xuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciBwcm90b3R5cGVTdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgdmFsaWQgPSBwcm90b3R5cGVTdHIgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICByZXN1bHRzLnB1c2goe1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYXJyYXlcIiwgXCJUeXBlIHdhcyA6XCIrcHJvdG90eXBlU3RyLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgaWYgKGRvVmFsaWRhdGVJdGVtcykge1xuICAgICAgZm9yKHZhciBpIGluIHZhbCkge1xuICAgICAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGUpO1xuICAgICAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgICAgIGl0c2FJbnN0YW5jZS5fa2V5ID0gU3RyaW5nKGkpO1xuICAgICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2ldOyB9O1xuICAgICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UudmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJldHdlZW5CdWlsZGVyKG1pbiwgbWF4LCBpbmNsdXNpdmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGJldHdlZW5DaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPj0gbWluICYmIHZhbCA8PSBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IGJldHdlZW4gbWluaW11bSBhbmQgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPiBtaW4gJiYgdmFsIDwgbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBiZXR3ZWVuIG1pbmltdW0gYW5kIG1heGltdW0gKGV4Y2x1c2l2ZSkuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJvb2xlYW5CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gYm9vbGVhbkNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJib29sZWFuXCI7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGEgYm9vbGVhbi5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb250YWluc0J1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbnRhaW5zQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmluZGV4T2YpIHx8ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKTtcbiAgICB2YXIgdmFsaWQgPSBoYXNJbmRleE9mICYmIHZhbC5pbmRleE9mKHZhbHVlKSA+IC0xO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3VzdG9tQnVpbGRlcih2YWxpZGF0b3JGdW5jdGlvbikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyB2YWxpZGF0b3JGdW5jdGlvbiBnaXZlbiBpbiBpdHNhLmN1c3RvbSguLi4pXCI7XG4gIH1cblxuICByZXR1cm4gdmFsaWRhdG9yRnVuY3Rpb24uYmluZCh0aGlzKTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkYXRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRhdGVDaGVja2VyKHZhbCkge1xuICAgIHZhciBjbGFzc1R5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgdmFsaWQgPSBjbGFzc1R5cGUgPT09IFwiW29iamVjdCBEYXRlXVwiICYmIGlzRmluaXRlKHZhbCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiSW52YWxpZCBkYXRlXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZhdWx0QnVpbGRlciAoZGVmYXVsdFZhbCkge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAoYXJncy5sZW5ndGggPT09IDApe1xuICAgIHRocm93IFwiTm8gZGVmYXVsdCB2YWx1ZSB3YXMgZ2l2ZW4gaW4gYC5kZWZhdWx0KC4uLilgLlwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlZmF1bHRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgLy9tYWtlIHN1cmUgdGhlcmUgaXMgYSBwYXJlbnQgb2JqZWN0XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC5kZWZhdWx0KC4uLilgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdC5cIjtcbiAgICB9XG5cbiAgICB2YXIgaXNGYWxzeSA9ICF2YWw7XG4gICAgaWYgKGlzRmFsc3kpe1xuICAgICAgc2V0dGVyKHR5cGVvZiBkZWZhdWx0VmFsID09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWwoKSA6IGRlZmF1bHRWYWwpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdE5vd0J1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZGVmYXVsdE5vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLmRlZmF1bHROb3coKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIGlmICghdmFsKSB7XG4gICAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gICAgfVxuICB9O1xufTsiLCJcbnZhciByeCA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtYWlsQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVtYWlsQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGFuIGVtYWlsIGFkZHJlc3MuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbXB0eUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbXB0eUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIGNsYXNzVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIikge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoY2xhc3NUeXBlID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgICAgdmFyIG51bWJlck9mRmllbGRzID0gMDtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgbnVtYmVyT2ZGaWVsZHMgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW1iZXJPZkZpZWxkcyA9PT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIGVtcHR5LCBidXQgbnVtYmVyIG9mIGZpZWxkcyBpczogXCIrbnVtYmVyT2ZGaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwiVHlwZSBjYW5ub3QgYmUgZW1wdHk6IFwiK2NsYXNzVHlwZTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmRzV2l0aEJ1aWxkZXIodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVuZHNXaXRoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmxhc3RJbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgaWYgKCFoYXNJbmRleE9mKSB7XG4gICAgICByZXR1cm4gXCJEYXRhIGhhcyBubyBsYXN0SW5kZXhPZiwgc28gdGhlcmUncyBubyB3YXkgdG8gY2hlY2sgYC5lbmRzV2l0aCgpYC5cIjtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gdmFsLmxhc3RJbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKXtcbiAgICAgIHJldHVybiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gICAgfVxuXG4gICAgdmFyIHZhbHVlTGVuZ3RoID0gKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkgfHwgMDtcbiAgICB2YWx1ZUxlbmd0aCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgPyB2YWx1ZUxlbmd0aCA6IDE7XG4gICAgLy9vdXRzaWRlIHZhbHVlIGlzIGEgc3RyaW5nIGFuZCBpbnNpZGUgdmFsdWUgaXMgYW4gZW1wdHkgc3RyaW5nPyB0aGF0J3MgZXZlcnl3aGVyZVxuICAgIGlmICh2YWx1ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciB2YWxpZCA9IGluZGV4ID09PSAodmFsLmxlbmd0aCAtIHZhbHVlTGVuZ3RoKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJEYXRhIGNvbnRhaW5zIHRoZSB2YWx1ZSwgYnV0IGRvZXMgbm90IGVuZCB3aXRoIGl0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVxdWFsQnVpbGRlcihleGFtcGxlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGNvbXBhcmlzb24gb2JqZWN0IGdpdmVuIGluIGl0c2EuZXF1YWwoLi4uKVwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGVxdWFsQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSBleGFtcGxlID09PSB2YWw7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiVmFsdWUgZGlkIG5vdCBwYXNzIGVxdWFsaXR5IHRlc3QuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc2VCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc2VDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IGZhbHNlID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGBmYWxzZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmYWxzeUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmYWxzeUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuICF2YWwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgZmFsc3kuXCI7XG4gIH07XG59O1xuXG4iLCJcbnZhciByeCA9IC9eWzAtOWEtZl0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhleEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoZXhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgaGV4LCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGhleC5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWxwaGFudW1lcmljXCI6IHJlcXVpcmUoJy4vYWxwaGFudW1lcmljJyksXG4gIFwiYW55XCI6IHJlcXVpcmUoJy4vYW55JyksXG4gIFwiYXJyYXlcIjogcmVxdWlyZSgnLi9hcnJheScpLFxuICBcImFycmF5T2ZcIjogcmVxdWlyZSgnLi9hcnJheU9mJyksXG4gIFwiYmV0d2VlblwiOiByZXF1aXJlKCcuL2JldHdlZW4nKSxcbiAgXCJib29sZWFuXCI6IHJlcXVpcmUoJy4vYm9vbGVhbicpLFxuICBcImN1c3RvbVwiOiByZXF1aXJlKCcuL2N1c3RvbScpLFxuICBcImNvbnRhaW5zXCI6IHJlcXVpcmUoJy4vY29udGFpbnMnKSxcbiAgXCJkYXRlXCI6IHJlcXVpcmUoJy4vZGF0ZScpLFxuICBcImRlZmF1bHRcIjogcmVxdWlyZSgnLi9kZWZhdWx0JyksXG4gIFwiZGVmYXVsdE5vd1wiOiByZXF1aXJlKCcuL2RlZmF1bHROb3cnKSxcbiAgXCJlbWFpbFwiOiByZXF1aXJlKCcuL2VtYWlsJyksXG4gIFwiZW1wdHlcIjogcmVxdWlyZSgnLi9lbXB0eScpLFxuICBcImVuZHNXaXRoXCI6IHJlcXVpcmUoJy4vZW5kc1dpdGgnKSxcbiAgXCJlcXVhbFwiOiByZXF1aXJlKCcuL2VxdWFsJyksXG4gIFwiZmFsc2VcIjogcmVxdWlyZSgnLi9mYWxzZScpLFxuICBcImZhbHN5XCI6IHJlcXVpcmUoJy4vZmFsc3knKSxcbiAgXCJoZXhcIjogcmVxdWlyZSgnLi9oZXgnKSxcbiAgXCJpbnRlZ2VyXCI6IHJlcXVpcmUoJy4vaW50ZWdlcicpLFxuICBcImpzb25cIjogcmVxdWlyZSgnLi9qc29uJyksXG4gIFwibGVuXCI6IHJlcXVpcmUoJy4vbGVuJyksXG4gIFwibG93ZXJjYXNlXCI6IHJlcXVpcmUoJy4vbG93ZXJjYXNlJyksXG4gIFwibWF0Y2hlc1wiOiByZXF1aXJlKCcuL21hdGNoZXMnKSxcbiAgXCJtYXhMZW5ndGhcIjogcmVxdWlyZSgnLi9tYXhMZW5ndGgnKSxcbiAgXCJtaW5MZW5ndGhcIjogcmVxdWlyZSgnLi9taW5MZW5ndGgnKSxcbiAgXCJuYW5cIjogcmVxdWlyZSgnLi9uYW4nKSxcbiAgXCJub3RFbXB0eVwiOiByZXF1aXJlKCcuL25vdEVtcHR5JyksXG4gIFwibnVsbFwiOiByZXF1aXJlKCcuL251bGwnKSxcbiAgXCJudW1iZXJcIjogcmVxdWlyZSgnLi9udW1iZXInKSxcbiAgXCJvYmplY3RcIjogcmVxdWlyZSgnLi9vYmplY3QnKSxcbiAgXCJvdmVyXCI6IHJlcXVpcmUoJy4vb3ZlcicpLFxuICBcInN0YXJ0c1dpdGhcIjogcmVxdWlyZSgnLi9zdGFydHNXaXRoJyksXG4gIFwic3RyaW5nXCI6IHJlcXVpcmUoJy4vc3RyaW5nJyksXG4gIFwidG9cIjogcmVxdWlyZSgnLi90bycpLFxuICBcInRvRGF0ZVwiOiByZXF1aXJlKCcuL3RvRGF0ZScpLFxuICBcInRvRmxvYXRcIjogcmVxdWlyZSgnLi90b0Zsb2F0JyksXG4gIFwidG9JbnRlZ2VyXCI6IHJlcXVpcmUoJy4vdG9JbnRlZ2VyJyksXG4gIFwidG9Mb3dlcmNhc2VcIjogcmVxdWlyZSgnLi90b0xvd2VyY2FzZScpLFxuICBcInRvTm93XCI6IHJlcXVpcmUoJy4vdG9Ob3cnKSxcbiAgXCJ0b1N0cmluZ1wiOiByZXF1aXJlKCcuL3RvU3RyaW5nJyksXG4gIFwidG9UcmltbWVkXCI6IHJlcXVpcmUoJy4vdG9UcmltbWVkJyksXG4gIFwidG9VcHBlcmNhc2VcIjogcmVxdWlyZSgnLi90b1VwcGVyY2FzZScpLFxuICBcInRydWVcIjogcmVxdWlyZSgnLi90cnVlJyksXG4gIFwidHJ1dGh5XCI6IHJlcXVpcmUoJy4vdHJ1dGh5JyksXG4gIFwidW5kZWZpbmVkXCI6IHJlcXVpcmUoJy4vdW5kZWZpbmVkJyksXG4gIFwidW5kZXJcIjogcmVxdWlyZSgnLi91bmRlcicpLFxuICBcInVuaXF1ZVwiOiByZXF1aXJlKCcuL3VuaXF1ZScpLFxuICBcInVwcGVyY2FzZVwiOiByZXF1aXJlKCcuL3VwcGVyY2FzZScpXG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW50ZWdlckJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpbnRlZ2VyQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiXG4gICAgICAgICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlXG4gICAgICAgICYmIFtOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWV0uaW5kZXhPZih2YWwpID09PSAtMVxuICAgICAgICAmJiB2YWwgJSAxID09PSAwO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgaW50ZWdlclwiO1xuICB9O1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBqc29uQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGpzb25DaGVja2VyKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gXCJKU09OIG11c3QgYmUgYSBzdHJpbmcuXCI7XG4gICAgfVxuXG4gICAgdHJ5e1xuICAgICAgSlNPTi5wYXJzZSh2YWwpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgcmV0dXJuIFwiVmFsdWUgaXMgYSBub3QgdmFsaWQgSlNPTiBzdHJpbmcuXCI7XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGVuQnVpbGRlcihleGFjdE9yTWluLCBtYXgpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgdmFyIHZhbGlkYXRpb25UeXBlID0gXCJ0cnV0aHlcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB2YWxpZGF0aW9uVHlwZSA9IFwiZXhhY3RcIjtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB2YWxpZGF0aW9uVHlwZSA9IFwiYmV0d2VlblwiO1xuXG4gIHJldHVybiBmdW5jdGlvbiBsZW5DaGVja2VyKHZhbCkge1xuICAgIHZhciBsZW5ndGggPSAodmFsIHx8ICh0eXBlb2YgdmFsKSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJ0cnV0aHlcIil7XG4gICAgICByZXR1cm4gbGVuZ3RoID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCB0cnV0aHkuXCI7XG4gICAgfWVsc2UgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcImV4YWN0XCIpe1xuICAgICAgcmV0dXJuIGxlbmd0aCA9PT0gZXhhY3RPck1pbiA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgZXhhY3RseTogXCIrZXhhY3RPck1pbjtcbiAgICB9ZWxzZSBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwiYmV0d2VlblwiKXtcbiAgICAgIHZhciB2YWxpZCA9IGxlbmd0aCA+PSBleGFjdE9yTWluICYmIGxlbmd0aCA8PSBtYXg7XG4gICAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJMZW5ndGggaXMgbm90IGJldHdlZW4gXCIrZXhhY3RPck1pbiArXCIgYW5kIFwiICsgbWF4O1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbnZhciByeCA9IC9bQS1aXS87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbG93ZXJjYXNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGxvd2VyY2FzZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIGNvbnRhaW5zIHVwcGVyY2FzZSBjaGFyYWN0ZXJzLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWF0Y2hlc0J1aWxkZXIocngpIHtcbiAgaWYgKHJ4IGluc3RhbmNlb2YgUmVnRXhwID09PSBmYWxzZSkge1xuICAgIHRocm93IFwiYC5tYXRjaGVzKC4uLilgIHJlcXVpcmVzIGEgcmVnZXhwXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gbWF0Y2hlc0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRvZXMgbm90IG1hdGNoIHJlZ2V4cC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWF4KSB7XG4gIGlmICh0eXBlb2YgbWF4ICE9IFwibnVtYmVyXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgbWF4aW11bSBpbiBtYXhMZW5ndGg6IFwiK21heDtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPD0gbWF4O1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJtYXhMZW5ndGhcIiwgXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtYXggaXMgXCIrbWF4LCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWluTGVuZ3RoQnVpbGRlcihtaW4pIHtcbiAgaWYgKHR5cGVvZiBtaW4gIT0gXCJudW1iZXJcIikge1xuICAgIHRocm93IFwiSW52YWxpZCBtaW5pbXVtIGluIG1pbkxlbmd0aDogXCIrbWluO1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiBtaW5MZW5ndGhDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCB0eXBlID09PSBcInN0cmluZ1wiKSA/IHZhbC5sZW5ndGggOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIGxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBsZW5ndGggPj0gbWluO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiAoXCJMZW5ndGggaXMgXCIrbGVuZ3RoK1wiLCBtaW4gaXMgXCIrbWluKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBuYW5CdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbmFuQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gaXNOYU4odmFsKSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBOYU4uXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3RFbXB0eUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBub3RFbXB0eUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIGNsYXNzVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIikge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggIT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBub3QgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCAhPT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIG5vdCBlbXB0eSwgYnV0IGxlbmd0aCBpczogXCIrdmFsLmxlbmd0aDtcbiAgICB9XG5cbiAgICBpZiAoY2xhc3NUeXBlID09PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgICB2YXIgbnVtYmVyT2ZGaWVsZHMgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgICBudW1iZXJPZkZpZWxkcyArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bWJlck9mRmllbGRzICE9PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgbm90IGVtcHR5LCBidXQgbnVtYmVyIG9mIGZpZWxkcyBpczogXCIrbnVtYmVyT2ZGaWVsZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIFwiVHlwZSBjYW5ub3QgYmUgbm90LWVtcHR5OiBcIitjbGFzc1R5cGU7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbnVsbEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBudWxsQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSBudWxsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IG51bGwuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBudW1iZXJCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbnVtYmVyQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdmFsaWQgPSB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiXG4gICAgICAmJiBpc05hTih2YWwpID09PSBmYWxzZVxuICAgICAgJiYgW051bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZXS5pbmRleE9mKHZhbCkgPT09IC0xO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgbnVtYmVyXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhhbXBsZSwgYWxsb3dFeHRyYUZpZWxkcykge1xuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBhbGxvd0V4dHJhRmllbGRzID0gYWxsb3dFeHRyYUZpZWxkcyB8fCBhcmdzLmxlbmd0aCA9PT0gMDtcblxuICAvKlxuICAgKiBUaGUgZXhhbXBsZSBpcyBhbiBvYmplY3Qgd2hlcmUgdGhlIGtleXMgYXJlIHRoZSBmaWVsZCBuYW1lc1xuICAgKiBhbmQgdGhlIHZhbHVlcyBhcmUgaXRzYSBpbnN0YW5jZXMuXG4gICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAgKi9cbiAgZm9yKHZhciBrZXkgaW4gZXhhbXBsZSkge1xuICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcbiAgICB2YXIgaXRzYUluc3RhbmNlID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKGV4YW1wbGVba2V5XSk7XG4gICAgZXhhbXBsZVtrZXldID0gaXRzYUluc3RhbmNlO1xuICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcztcbiAgICBpdHNhSW5zdGFuY2UuX2tleSA9IGtleTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih2YWwpe1xuXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgIC8vIHR5cGVvZiBbXSwgbnVsbCwgZXRjIGFyZSBvYmplY3QsIHNvIHVzZSB0aGlzIGNoZWNrIGZvciBhY3R1YWwgb2JqZWN0c1xuICAgIHZhciBwcm90b3R5cGVTdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgdmFsaWQgPSBwcm90b3R5cGVTdHIgPT09IFwiW29iamVjdCBPYmplY3RdXCI7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcIm9iamVjdFwiLCBcIlR5cGUgd2FzOiBcIitwcm90b3R5cGVTdHIsIHZhbGlkKV1cbiAgICB9KTtcbiAgICBpZiAodmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0c1swXTtcbiAgICB9XG5cbiAgICAvL2V4dHJhIGZpZWxkcyBub3QgYWxsb3dlZD9cbiAgICBpZiAoYWxsb3dFeHRyYUZpZWxkcyA9PT0gZmFsc2UpIHtcbiAgICAgIHZhciBpbnZhbGlkRmllbGRzID0gW107XG4gICAgICBmb3IodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgaWYgKGtleSBpbiBleGFtcGxlID09PSBmYWxzZSkge1xuICAgICAgICAgIGludmFsaWRGaWVsZHMucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaW52YWxpZEZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcIm9iamVjdFwiLCBcIlVuZXhwZWN0ZWQgZmllbGRzOiBcIitpbnZhbGlkRmllbGRzLmpvaW4oKSwgZmFsc2UpXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcih2YXIga2V5IGluIGV4YW1wbGUpIHtcbiAgICAgIGlmICghZXhhbXBsZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSBjb250aW51ZTtcblxuICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IGV4YW1wbGVba2V5XTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxba2V5XTsgfTtcbiAgICAgIHZhciBzZXR0ZXIgPSBmdW5jdGlvbiAobmV3VmFsKSB7IHZhbFtrZXldID0gbmV3VmFsOyB9O1xuICAgICAgdmFyIHJlc3VsdCA9IGl0c2FJbnN0YW5jZS52YWxpZGF0ZS5hcHBseShpdHNhSW5zdGFuY2UsIFtnZXR0ZXIsIHNldHRlcl0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG92ZXJCdWlsZGVyKG1pbiwgaW5jbHVzaXZlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBvdmVyQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAoaW5jbHVzaXZlKSB7XG4gICAgICByZXR1cm4gdmFsID49IG1pbiA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3Qgb3ZlciB0aGUgbWluaW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPiBtaW4gPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IG92ZXIgdGhlIG1pbmltdW0gKGV4Y2x1c2l2ZSkuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0YXJ0c1dpdGhCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBzdGFydHNXaXRoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgaGFzSW5kZXhPZiA9ICh2YWwgJiYgdmFsLmluZGV4T2YpIHx8ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKTtcbiAgICBpZiAoIWhhc0luZGV4T2YpIHtcbiAgICAgIHJldHVybiBcIkRhdGEgaGFzIG5vIGluZGV4T2YsIHNvIHRoZXJlJ3Mgbm8gd2F5IHRvIGNoZWNrIGAuc3RhcnRzV2l0aCgpYC5cIjtcbiAgICB9XG4gICAgdmFyIGluZGV4ID0gdmFsLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpe1xuICAgICAgcmV0dXJuIFwiRGF0YSBkb2VzIG5vdCBjb250YWluIHRoZSB2YWx1ZS5cIjtcbiAgICB9XG4gICAgcmV0dXJuIGluZGV4ID09PSAwID8gbnVsbCA6IFwiRGF0YSBjb250YWlucyB0aGUgdmFsdWUsIGJ1dCBkb2VzIG5vdCBzdGFydCB3aXRoIGl0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgdmFyIHZhbGlkID0gdHlwZSA9PT0gXCJzdHJpbmdcIjtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwic3RyaW5nXCIsIFwiRXhwZWN0ZWQgYSBzdHJpbmcsIGJ1dCBmb3VuZCBhIFwiK3R5cGUsIHZhbGlkKV0sXG4gICAgfTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0J1aWxkZXIgKHZhbHVlT3JHZXR0ZXIpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGRlZmF1bHQgdmFsdWUgd2FzIGdpdmVuIGluIGAudG8oLi4uKWAuXCI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gdG9SdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC50byguLi4pYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG4gICAgfVxuXG4gICAgc2V0dGVyKHR5cGVvZiB2YWx1ZU9yR2V0dGVyID09IFwiZnVuY3Rpb25cIiA/IHZhbHVlT3JHZXR0ZXIoKSA6IHZhbHVlT3JHZXR0ZXIpO1xuICB9O1xufTsiLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9EYXRlQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b0RhdGVSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b0RhdGUoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHJldHVybiBcIlVud2lsbGluZyB0byBwYXJzZSBmYWxzeSB2YWx1ZXMuXCI7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICAgIHJldHVybiBcIlVud2lsbGluZyB0byBwYXJzZSBhcnJheXMuXCI7XG4gICAgfVxuXG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh2YWwpO1xuICAgIGlmIChpc0Zpbml0ZShkYXRlKSkge1xuICAgICAgc2V0dGVyKGRhdGUpO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIHBhcnNlIGRhdGUuXCI7XG4gICAgfVxuICB9O1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0Zsb2F0QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b0Zsb2F0UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9GbG9hdCgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBwYXJzZUZsb2F0KHZhbCk7XG4gICAgaWYgKHZhbCA9PT0gbmV3VmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNOYU4obmV3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gY29udmVydCBkYXRhIHRvIGZsb2F0LlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0ludGVnZXJCdWlsZGVyIChyYWRpeCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9JbnRlZ2VyUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9JbnRlZ2VyKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IHBhcnNlSW50KHZhbCwgdHlwZW9mIHJhZGl4ID09PSBcInVuZGVmaW5lZFwiID8gMTAgOiByYWRpeCk7XG4gICAgaWYgKHZhbCA9PT0gbmV3VmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNOYU4obmV3VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJVbmFibGUgdG8gY29udmVydCBkYXRhIHRvIGludGVnZXIuXCI7XG4gICAgfWVsc2V7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b0xvd2VyY2FzZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9Mb3dlcmNhc2VSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b0xvd2VyY2FzZSgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Ob3dCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTm93UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAudG9Ob3coKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIHNldHRlcihuZXcgRGF0ZSgpKTtcbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9TdHJpbmdCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvU3RyaW5nUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9TdHJpbmcoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gU3RyaW5nKHZhbCk7XG4gICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1RyaW1tZWRCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVHJpbW1lZFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvVHJpbW1lZCgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRyaW0oKTtcbiAgICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTsiLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b1VwcGVyY2FzZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9VcHBlcmNhc2VSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1VwcGVyY2FzZSgpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdmFsLnRvVXBwZXJDYXNlKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJ1ZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0cnVlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSB0cnVlID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGB0cnVlYC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydXRoeUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0cnV0aHlDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgdHJ1dGh5LlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5kZWZpbmVkQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuZGVmaW5lZENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHVuZGVmaW5lZC5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZGVyQnVpbGRlcihtYXgsIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gdW5kZXJDaGVja2VyKHZhbCkge1xuICAgIGlmIChpbmNsdXNpdmUpIHtcbiAgICAgIHJldHVybiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCB1bmRlciB0aGUgbWF4aW11bSAoaW5jbHVzaXZlKS5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiB2YWwgPCBtYXggPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IHVuZGVyIHRoZSBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmlxdWVCdWlsZGVyKGdldHRlcikge1xuICByZXR1cm4gZnVuY3Rpb24gdW5pcXVlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpO1xuICAgIHZhciB2YWxpZFR5cGVzID0gW1wiW29iamVjdCBBcnJheV1cIiwgXCJbb2JqZWN0IE9iamVjdF1cIiwgXCJbb2JqZWN0IFN0cmluZ11cIl07XG4gICAgdmFyIGlzVHlwZVZhbGlkID0gdmFsaWRUeXBlcy5pbmRleE9mKHR5cGUpID4gLTE7XG4gICAgaWYgKCFpc1R5cGVWYWxpZCkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNoZWNrIHVuaXF1ZW5lc3Mgb24gdGhpcyB0eXBlIG9mIGRhdGEuXCI7XG4gICAgfVxuXG4gICAgdmFyIGdldHRlclR5cGUgPSBcIlwiO1xuICAgIGlmICh0eXBlb2YgZ2V0dGVyID09PSBcImZ1bmN0aW9uXCIpIHsgZ2V0dGVyVHlwZSA9IFwiZnVuY3Rpb25cIjsgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBnZXR0ZXIgIT09IFwidW5kZWZpbmVkXCIpIHsgZ2V0dGVyVHlwZSA9IFwicGx1Y2tcIjsgfVxuXG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgdmFyIGl0ZW0gPSB2YWxba2V5XTtcbiAgICAgIGlmIChnZXR0ZXJUeXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaXRlbSA9IGdldHRlcihpdGVtKTtcbiAgICAgIH1cbiAgICAgIGlmIChnZXR0ZXJUeXBlID09PSBcInBsdWNrXCIpIHtcbiAgICAgICAgaXRlbSA9IGl0ZW1bZ2V0dGVyXTtcbiAgICAgIH1cbiAgICAgIHZhciBhbHJlYWR5Rm91bmQgPSBpdGVtcy5pbmRleE9mKGl0ZW0pID4gLTE7XG4gICAgICBpZiAoYWxyZWFkeUZvdW5kKSB7XG4gICAgICAgIHJldHVybiBcIkl0ZW1zIGFyZSBub3QgdW5pcXVlLlwiO1xuICAgICAgfVxuICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59O1xuXG4iLCJcbnZhciByeCA9IC9bYS16XS87XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXBwZXJjYXNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwcGVyY2FzZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiAmJiAhcngudGVzdCh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIGNvbnRhaW5zIGxvd2VyY2FzZSBjaGFyYWN0ZXJzLlwiO1xuICB9O1xufTtcblxuIl19
