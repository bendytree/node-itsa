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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hbGlhc2VzLmpzIiwibGliL2l0c2EuanMiLCJsaWIvbWV0aG9kcy9hbGlhcy5qcyIsImxpYi9tZXRob2RzL2J1aWxkLWZpbmFsLXJlc3VsdC5qcyIsImxpYi9tZXRob2RzL2J1aWxkLWxvZy5qcyIsImxpYi9tZXRob2RzL2NvbWJpbmUtcmVzdWx0cy5qcyIsImxpYi9tZXRob2RzL2NvbnZlcnQtdmFsaWRhdG9yLXRvLWl0c2EtaW5zdGFuY2UuanMiLCJsaWIvbWV0aG9kcy9leHRlbmQuanMiLCJsaWIvbWV0aG9kcy9tc2cuanMiLCJsaWIvbWV0aG9kcy92YWxpZGF0ZS5qcyIsImxpYi92YWxpZGF0b3JzL2FscGhhbnVtZXJpYy5qcyIsImxpYi92YWxpZGF0b3JzL2FueS5qcyIsImxpYi92YWxpZGF0b3JzL2FycmF5LmpzIiwibGliL3ZhbGlkYXRvcnMvYXJyYXlPZi5qcyIsImxpYi92YWxpZGF0b3JzL2JldHdlZW4uanMiLCJsaWIvdmFsaWRhdG9ycy9ib29sZWFuLmpzIiwibGliL3ZhbGlkYXRvcnMvY29udGFpbnMuanMiLCJsaWIvdmFsaWRhdG9ycy9jdXN0b20uanMiLCJsaWIvdmFsaWRhdG9ycy9kYXRlLmpzIiwibGliL3ZhbGlkYXRvcnMvZGVmYXVsdC5qcyIsImxpYi92YWxpZGF0b3JzL2RlZmF1bHROb3cuanMiLCJsaWIvdmFsaWRhdG9ycy9lbWFpbC5qcyIsImxpYi92YWxpZGF0b3JzL2VtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvZW5kc1dpdGguanMiLCJsaWIvdmFsaWRhdG9ycy9lcXVhbC5qcyIsImxpYi92YWxpZGF0b3JzL2ZhbHNlLmpzIiwibGliL3ZhbGlkYXRvcnMvZmFsc3kuanMiLCJsaWIvdmFsaWRhdG9ycy9oZXguanMiLCJsaWIvdmFsaWRhdG9ycy9pbmRleC5qcyIsImxpYi92YWxpZGF0b3JzL2ludGVnZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9qc29uLmpzIiwibGliL3ZhbGlkYXRvcnMvbGVuLmpzIiwibGliL3ZhbGlkYXRvcnMvbG93ZXJjYXNlLmpzIiwibGliL3ZhbGlkYXRvcnMvbWF0Y2hlcy5qcyIsImxpYi92YWxpZGF0b3JzL21heExlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL21pbkxlbmd0aC5qcyIsImxpYi92YWxpZGF0b3JzL25hbi5qcyIsImxpYi92YWxpZGF0b3JzL25vdEVtcHR5LmpzIiwibGliL3ZhbGlkYXRvcnMvbnVsbC5qcyIsImxpYi92YWxpZGF0b3JzL251bWJlci5qcyIsImxpYi92YWxpZGF0b3JzL29iamVjdC5qcyIsImxpYi92YWxpZGF0b3JzL292ZXIuanMiLCJsaWIvdmFsaWRhdG9ycy9zdGFydHNXaXRoLmpzIiwibGliL3ZhbGlkYXRvcnMvc3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG8uanMiLCJsaWIvdmFsaWRhdG9ycy90b0RhdGUuanMiLCJsaWIvdmFsaWRhdG9ycy90b0Zsb2F0LmpzIiwibGliL3ZhbGlkYXRvcnMvdG9JbnRlZ2VyLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9Mb3dlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90b05vdy5qcyIsImxpYi92YWxpZGF0b3JzL3RvU3RyaW5nLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9UcmltbWVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdG9VcHBlcmNhc2UuanMiLCJsaWIvdmFsaWRhdG9ycy90cnVlLmpzIiwibGliL3ZhbGlkYXRvcnMvdHJ1dGh5LmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZWZpbmVkLmpzIiwibGliL3ZhbGlkYXRvcnMvdW5kZXIuanMiLCJsaWIvdmFsaWRhdG9ycy91bmlxdWUuanMiLCJsaWIvdmFsaWRhdG9ycy91cHBlcmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9pdHNhXCIpO1xuIiwiXG4vKipcbiAqIEEgbGlzdCBvZiBidWlsdCBpbiBhbGlhc2VzIGZvciBpdHNhIHZhbGlkYXRvcnMuXG4gKlxuICogeyBcImFsaWFzTmFtZVwiIDogXCJyZWFsTmFtZVwiIH1cbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwiYWZ0ZXJcIjogXCJvdmVyXCIsXG4gIFwiYmVmb3JlXCI6IFwidW5kZXJcIlxufTtcbiIsIlxudmFyIGl0c2EgPSBmdW5jdGlvbiAoKSB7XG4gIC8vZm9yY2UgYG5ld2BcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGl0c2EpKSB7IHJldHVybiBuZXcgaXRzYSgpOyB9XG5cbiAgdGhpcy52YWxpZGF0b3JzID0gW107XG4gIHRoaXMuZXJyb3JNZXNzYWdlcyA9IHt9O1xufTtcblxuLy8gUHJpdmF0ZVxuaXRzYS5wcm90b3R5cGUuX2J1aWxkTG9nID0gcmVxdWlyZShcIi4vbWV0aG9kcy9idWlsZC1sb2dcIik7XG5pdHNhLnByb3RvdHlwZS5fYnVpbGRGaW5hbFJlc3VsdCA9IHJlcXVpcmUoXCIuL21ldGhvZHMvYnVpbGQtZmluYWwtcmVzdWx0XCIpO1xuaXRzYS5wcm90b3R5cGUuX2NvbWJpbmVSZXN1bHRzID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb21iaW5lLXJlc3VsdHNcIik7XG5pdHNhLnByb3RvdHlwZS5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlID0gcmVxdWlyZShcIi4vbWV0aG9kcy9jb252ZXJ0LXZhbGlkYXRvci10by1pdHNhLWluc3RhbmNlXCIpO1xuaXRzYS5wcm90b3R5cGUuX2l0c2EgPSBpdHNhO1xuXG4vLyBQdWJsaWNcbml0c2EucHJvdG90eXBlLnZhbGlkYXRlID0gcmVxdWlyZShcIi4vbWV0aG9kcy92YWxpZGF0ZVwiKTtcbml0c2EucHJvdG90eXBlLm1zZyA9IHJlcXVpcmUoXCIuL21ldGhvZHMvbXNnXCIpO1xuaXRzYS5leHRlbmQgPSByZXF1aXJlKFwiLi9tZXRob2RzL2V4dGVuZFwiKTtcbml0c2EuYWxpYXMgPSByZXF1aXJlKFwiLi9tZXRob2RzL2FsaWFzXCIpO1xuXG4vLyBCdWlsdCBpbiB2YWxpZGF0b3JzXG5pdHNhLmV4dGVuZChyZXF1aXJlKFwiLi92YWxpZGF0b3JzXCIpKTtcblxuLy8gQWRkIGFsaWFzZXNcbnZhciBhbGlhc2VzID0gcmVxdWlyZShcIi4vYWxpYXNlc1wiKTtcbmZvciAodmFyIGtleSBpbiBhbGlhc2VzKXtcbiAgaXRzYS5hbGlhcyhhbGlhc2VzW2tleV0sIGtleSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpdHNhO1xuIiwiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbGlhcyhvbGROYW1lLCBuZXdOYW1lKSB7XG4gIHRoaXNbbmV3TmFtZV0gPSB0aGlzLnByb3RvdHlwZVtuZXdOYW1lXSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXNbb2xkTmFtZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxufTtcbiIsIlxudmFyIEZpbmFsUmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICB0aGlzLnZhbGlkID0gcmVzdWx0LnZhbGlkO1xuICB0aGlzLmxvZ3MgPSByZXN1bHQubG9ncztcbn07XG5cbkZpbmFsUmVzdWx0LnByb3RvdHlwZS5kZXNjcmliZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy92YWxpZD8gY29vbCBzdG9yeSBicm9cbiAgaWYgKHRoaXMudmFsaWQpIHtcbiAgICByZXR1cm4gXCJWYWxpZGF0aW9uIHN1Y2NlZWRlZC5cIjtcbiAgfVxuXG4gIC8vaW52YWxpZFxuICB2YXIgbWVzc2FnZXMgPSBbXTtcbiAgZm9yICh2YXIgaSBpbiB0aGlzLmxvZ3Mpe1xuICAgIHZhciBsb2cgPSB0aGlzLmxvZ3NbaV07XG4gICAgaWYgKGxvZy52YWxpZCkgY29udGludWU7XG4gICAgaWYgKGxvZy5jdXN0b21NZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKGxvZy5jdXN0b21NZXNzYWdlKTtcbiAgICB9ZWxzZXtcbiAgICAgIG1lc3NhZ2VzLnB1c2goKGxvZy5wYXRoID8gKGxvZy5wYXRoICsgXCI6IFwiKSA6IFwiXCIpICsgbG9nLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXNzYWdlcy5qb2luKFwiXFxuXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHJldHVybiBuZXcgRmluYWxSZXN1bHQocmVzdWx0KTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsaWRhdG9yLCBtc2csIHZhbGlkKSB7XG4gIHZhciBwYXRocyA9IFtdO1xuICB2YXIgbm9kZSA9IHRoaXM7XG4gIHdoaWxlIChub2RlICYmIG5vZGUuX2tleSkge1xuICAgIHBhdGhzLnNwbGljZSgwLCAwLCBub2RlLl9rZXkpO1xuICAgIG5vZGUgPSBub2RlLl9wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB2YWxpZDogdmFsaWQsXG4gICAgcGF0aDogcGF0aHMuam9pbihcIi5cIiksXG4gICAgdmFsaWRhdG9yOiB2YWxpZGF0b3IsXG4gICAgbWVzc2FnZTogbXNnLFxuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gIC8vb25lIHJlc3VsdD8gc2hvcnRjdXRcbiAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gIH1cblxuICB2YXIgdmFsaWQgPSB0cnVlO1xuICB2YXIgbG9ncyA9IFtdO1xuXG4gIGZvciAodmFyIGkgaW4gcmVzdWx0cykge1xuICAgIHZhciByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgIHZhbGlkID0gdmFsaWQgJiYgcmVzdWx0LnZhbGlkO1xuXG4gICAgaWYgKHJlc3VsdC5sb2dzICYmIHJlc3VsdC5sb2dzLmxlbmd0aCkge1xuICAgICAgbG9ncy5wdXNoLmFwcGx5KGxvZ3MsIHJlc3VsdC5sb2dzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyB2YWxpZDogdmFsaWQsIGxvZ3M6IGxvZ3MgfTtcbn07IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWxpZGF0b3IpIHtcbiAgLy9hbHJlYWR5IGFuIGBpdHNhYCBpbnN0YW5jZT9cbiAgaWYgKHR5cGVvZiB2YWxpZGF0b3IgPT09IFwib2JqZWN0XCIgJiYgdmFsaWRhdG9yIGluc3RhbmNlb2YgdGhpcy5faXRzYSkge1xuICAgIHJldHVybiB2YWxpZGF0b3I7XG4gIH1cblxuICAvL25vdCBhbiBpbnN0YW5jZSB5ZXQsIHNvIGNyZWF0ZSBvbmVcbiAgdmFyIGluc3RhbmNlID0gbmV3IHRoaXMuX2l0c2EoKTtcbiAgaW5zdGFuY2UudmFsaWRhdG9ycy5wdXNoKHZhbGlkYXRvcik7XG4gIHJldHVybiBpbnN0YW5jZTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKGV4dGVuc2lvbnMpIHtcbiAgZm9yICh2YXIgbmFtZSBpbiBleHRlbnNpb25zKSB7XG4gICAgLy9pZ25vcmUgaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAgICBpZiAoIWV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHsgY29udGludWU7IH1cblxuICAgIGFzc2lnbih0aGlzLCBuYW1lLCBleHRlbnNpb25zW25hbWVdKTtcbiAgfVxufTtcblxudmFyIGFzc2lnbiA9IGZ1bmN0aW9uIChpdHNhLCBuYW1lLCBidWlsZGVyKSB7XG5cbiAgLyoqXG4gICAqIEFsbG93cyBzdGF0aWMgYWNjZXNzIC0gbGlrZSBgaXRzYS5zdHJpbmcoKWBcbiAgICovXG4gIGl0c2FbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IGl0c2EoKTtcbiAgICBpbnN0YW5jZS52YWxpZGF0b3JzID0gW2J1aWxkZXIuYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50cyldO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvKipcbiAgICogQWxsb3dzIGNoYWluaW5nIC0gbGlrZSBgaXRzYS5zb21ldGhpbmcoKS5zdHJpbmcoKWBcbiAgICovXG4gIGl0c2EucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsaWRhdG9ycy5wdXNoKGJ1aWxkZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtc2cobXNnKSB7XG4gIGlmICh0eXBlb2YgbXNnICE9PSBcInN0cmluZ1wiIHx8ICFtc2cpIHtcbiAgICB0aHJvdyBcIi5tc2coLi4uKSBtdXN0IGJlIGdpdmVuIGFuIGVycm9yIG1lc3NhZ2VcIjtcbiAgfVxuXG4gIHRoaXMuZXJyb3JNZXNzYWdlc1t0aGlzLnZhbGlkYXRvcnNbdGhpcy52YWxpZGF0b3JzLmxlbmd0aC0xXV0gPSBtc2c7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuIiwiXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZ2V0dGVyLCBzZXR0ZXIpIHtcbiAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgZm9yICh2YXIgaSBpbiB0aGlzLnZhbGlkYXRvcnMpIHtcbiAgICB2YXIgdmFsaWRhdG9yID0gdGhpcy52YWxpZGF0b3JzW2ldO1xuXG4gICAgLy9nZXQgcmVzdWx0XG4gICAgdmFyIHJlc3VsdCA9IHJ1blZhbGlkYXRvcih0aGlzLCB2YWxpZGF0b3IsIGdldHRlciwgc2V0dGVyKTtcblxuICAgIC8vaW50ZXJwcmV0IHJlc3VsdFxuICAgIHJlc3VsdCA9IGludGVycHJldFJlc3VsdCh0aGlzLCByZXN1bHQpO1xuXG4gICAgLy9jdXN0b20gZXJyb3JcbiAgICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSAmJiB0aGlzLmVycm9yTWVzc2FnZXNbdmFsaWRhdG9yXSl7XG4gICAgICByZXN1bHQubG9nc1swXS5jdXN0b21NZXNzYWdlID0gdGhpcy5lcnJvck1lc3NhZ2VzW3ZhbGlkYXRvcl07XG4gICAgfVxuXG4gICAgLy9hZGQgaXQgdG8gbGlzdCBvZiByZXN1bHRzXG4gICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG5cbiAgICAvL2ludmFsaWQ/IHNob3J0IGNpcmN1aXRcbiAgICBpZiAocmVzdWx0LnZhbGlkID09PSBmYWxzZSkgeyBicmVhazsgfVxuICB9XG4gIHJldHVybiB0aGlzLl9idWlsZEZpbmFsUmVzdWx0KHRoaXMuX2NvbWJpbmVSZXN1bHRzKHJlc3VsdHMpKTtcbn07XG5cbnZhciBydW5WYWxpZGF0b3IgPSBmdW5jdGlvbiAoaXRzYUluc3RhbmNlLCB2YWxpZGF0b3IsIGdldHRlciwgc2V0dGVyKSB7XG4gIHRyeXtcbiAgICAvL2FscmVhZHkgYW4gaXRzYSBpbnN0YW5jZT8ganVzdCBydW4gdmFsaWRhdGVcbiAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PT0gXCJvYmplY3RcIiAmJiB2YWxpZGF0b3IgaW5zdGFuY2VvZiBpdHNhSW5zdGFuY2UuX2l0c2EpIHtcbiAgICAgIHJldHVybiB2YWxpZGF0b3IudmFsaWRhdGUoZ2V0dGVyLCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIC8vdGltZSB0byBnZXQgdGhlIHJlYWwgdmFsdWUgKGNvdWxkIGJlIGEgdmFsdWUgb3IgYSBmdW5jdGlvbilcbiAgICB2YXIgdmFsID0gdHlwZW9mIGdldHRlciA9PT0gXCJmdW5jdGlvblwiID8gZ2V0dGVyKCkgOiBnZXR0ZXI7XG5cbiAgICAvL2EgZnVuY3Rpb24/IGp1c3QgcnVuIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSB2YWx1ZVxuICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgcmV0dXJuIHZhbGlkYXRvci5jYWxsKGl0c2FJbnN0YW5jZSwgdmFsLCBzZXR0ZXIpO1xuICAgIH1cblxuICAgIC8vc29tZXRoaW5nIGVsc2UsIHNvIHRoaXMgaXMgYSA9PT0gY2hlY2tcbiAgICByZXR1cm4gdmFsID09PSB2YWxpZGF0b3I7XG4gIH1jYXRjaChlKXtcbiAgICByZXR1cm4gXCJVbmhhbmRsZWQgZXJyb3IuIFwiK1N0cmluZyhlKTtcbiAgfVxufTtcblxudmFyIGludGVycHJldFJlc3VsdCA9IGZ1bmN0aW9uIChpdHNhSW5zdGFuY2UsIHJlc3VsdCkge1xuICAvL3Jlc3VsdCBpcyBhIGJvb2xlYW4/XG4gIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcImJvb2xlYW5cIikge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZDogcmVzdWx0LFxuICAgICAgbG9nczogW2l0c2FJbnN0YW5jZS5fYnVpbGRMb2coXCJmdW5jdGlvblwiLCByZXN1bHQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOlwiVmFsaWRhdGlvbiBmYWlsZWRcIiwgcmVzdWx0KV1cbiAgICB9O1xuICB9XG5cbiAgLy9yZXN1bHQgaXMgYW4gb2JqZWN0P1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlc3VsdCkgPT09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy9vdGhlcndpc2UgaW50ZXJwcmV0IGl0IGFzIHN0cmluZz1lcnJvclxuICB2YXIgdmFsaWQgPSB0eXBlb2YgcmVzdWx0ICE9PSBcInN0cmluZ1wiIHx8ICFyZXN1bHQ7XG4gIHJldHVybiB7XG4gICAgdmFsaWQ6IHZhbGlkLFxuICAgIGxvZ3M6IFtpdHNhSW5zdGFuY2UuX2J1aWxkTG9nKFwiZnVuY3Rpb25cIiwgdmFsaWQ/XCJWYWxpZGF0aW9uIHN1Y2NlZWRlZFwiOnJlc3VsdCwgdmFsaWQpXVxuICB9O1xufTsiLCJcbnZhciByeCA9IC9eWzAtOWEtel0qJC9pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFscGhhbnVtZXJpY0J1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBhbHBoYW51bWVyaWNDaGVja2VyKHZhbCkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgICBpZiAoW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICByZXR1cm4gXCJWYWx1ZSBzaG91bGQgYmUgYWxwaGFudW1lcmljLCBidXQgaXNuJ3QgYSBzdHJpbmcgb3IgbnVtYmVyLlwiO1xuICAgIH1cbiAgICByZXR1cm4gcngudGVzdCh2YWwpID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGFscGhhbnVtZXJpYy5cIjtcbiAgfTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhbnlCdWlsZGVyKCkge1xuICAvL2NvbWJpbmUgdmFsaWRhdG9yc1xuICB2YXIgdmFsaWRhdG9ycyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBpZiAodmFsaWRhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBcIk5vIHZhbGlkYXRvcnMgZ2l2ZW4gaW4gaXRzYS5hbnkoKVwiO1xuICB9XG5cbiAgLy9jb252ZXJ0IGFsbCB2YWxpZGF0b3JzIHRvIHJlYWwgaXRzYSBpbnN0YW5jZXNcbiAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICB2YWxpZGF0b3JzW2ldID0gdGhpcy5fY29udmVydFZhbGlkYXRvclRvSXRzYUluc3RhbmNlKHZhbGlkYXRvcnNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGFueUNoZWNrZXIodmFsKSB7XG4gICAgLy9maW5kIHRoZSBmaXJzdCB2YWxpZCBtYXRjaFxuICAgIHZhciB2YWxpZFJlc3VsdCA9IG51bGw7XG4gICAgZm9yKHZhciBpIGluIHZhbGlkYXRvcnMpIHtcbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSB2YWxpZGF0b3JzW2ldO1xuXG4gICAgICAvL3NldCBzYW1lIGNvbnRleHQgb24gY2hpbGRyZW5cbiAgICAgIGl0c2FJbnN0YW5jZS5fcGFyZW50ID0gdGhpcy5fcGFyZW50O1xuICAgICAgaXRzYUluc3RhbmNlLl9rZXkgPSB0aGlzLl9rZXk7XG5cbiAgICAgIC8vZXhlY3V0ZSB2YWxpZGF0b3IgJiBzdG9wIGlmIHZhbGlkXG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLnZhbGlkYXRlKHZhbCk7XG4gICAgICBpZiAocmVzdWx0LnZhbGlkKSB7XG4gICAgICAgIHZhbGlkUmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3NlbmQgYmFjayB0aGUgcmVzdWx0XG4gICAgaWYgKHZhbGlkUmVzdWx0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMoW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsaWQ6IHRydWUsXG4gICAgICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwiYW55XCIsIFwiTWF0Y2ggZm91bmQuXCIsIHRydWUpXVxuICAgICAgICB9LFxuICAgICAgICB2YWxpZFJlc3VsdFxuICAgICAgXSk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFueVwiLCBcIk5vIG1hdGNoZXMgZm91bmQuXCIsIGZhbHNlKV1cbiAgICAgIH07XG4gICAgfVxuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFJdGVtcykge1xuICAvL2V4YW1wbGUgaXMgbWlzc2luZyBvciBhbiBhcnJheVxuICB2YXIgYXJncyA9IFtdLmNvbmNhdC5hcHBseShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICBhbGxvd0V4dHJhSXRlbXMgPSBhbGxvd0V4dHJhSXRlbXMgfHwgYXJncy5sZW5ndGggPT09IDA7XG4gIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICB2YXIgaXNFeGFtcGxlQXJyYXkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXhhbXBsZSkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICBpZiAoIWlzRXhhbXBsZUFycmF5KSB7XG4gICAgICB0aHJvdyBcImluIGAuYXJyYXkoZXhhbXBsZSlgLCBleGFtcGxlIG11c3QgYmUgb21pdHRlZCBvciBhbiBhcnJheVwiO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICogVGhlIGV4YW1wbGUgaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBpdGVtIGlzIGEgdmFsaWRhdG9yLlxuICAqIEFzc2lnbiBwYXJlbnQgaW5zdGFuY2UgYW5kIGtleVxuICAqL1xuICBmb3IodmFyIGkgaW4gZXhhbXBsZSkge1xuICAgIHZhciBpdHNhSW5zdGFuY2UgPSB0aGlzLl9jb252ZXJ0VmFsaWRhdG9yVG9JdHNhSW5zdGFuY2UoZXhhbXBsZVtpXSk7XG4gICAgZXhhbXBsZVtpXSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBTdHJpbmcoaSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgcHJvdG90eXBlU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gICAgdmFyIHZhbGlkID0gcHJvdG90eXBlU3RyID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiVHlwZSB3YXMgOlwiK3Byb3RvdHlwZVN0ciwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIC8vdG9vIG1hbnkgaXRlbXMgaW4gYXJyYXk/XG4gICAgaWYgKGFsbG93RXh0cmFJdGVtcyA9PT0gZmFsc2UgJiYgdmFsLmxlbmd0aCA+IGV4YW1wbGUubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogZmFsc2UsXG4gICAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiRXhhbXBsZSBoYXMgXCIrZXhhbXBsZS5sZW5ndGgrXCIgaXRlbXMsIGJ1dCBkYXRhIGhhcyBcIit2YWwubGVuZ3RoLCBmYWxzZSldXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZvcih2YXIgaSBpbiBleGFtcGxlKSB7XG4gICAgICB2YXIgaXRzYUluc3RhbmNlID0gZXhhbXBsZVtpXTtcbiAgICAgIHZhciBnZXR0ZXIgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWxbaV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxbaV0gPSBuZXdWYWw7IH07XG4gICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLnZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fY29tYmluZVJlc3VsdHMocmVzdWx0cyk7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgdmFyIGRvVmFsaWRhdGVJdGVtcyA9IGFyZ3MubGVuZ3RoID4gMDtcblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgcHJvdG90eXBlU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gICAgdmFyIHZhbGlkID0gcHJvdG90eXBlU3RyID09PSBcIltvYmplY3QgQXJyYXldXCI7XG4gICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcImFycmF5XCIsIFwiVHlwZSB3YXMgOlwiK3Byb3RvdHlwZVN0ciwgdmFsaWQpXVxuICAgIH0pO1xuICAgIGlmICh2YWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiByZXN1bHRzWzBdO1xuICAgIH1cblxuICAgIGlmIChkb1ZhbGlkYXRlSXRlbXMpIHtcbiAgICAgIGZvcih2YXIgaSBpbiB2YWwpIHtcbiAgICAgICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlKTtcbiAgICAgICAgaXRzYUluc3RhbmNlLl9wYXJlbnQgPSB0aGlzO1xuICAgICAgICBpdHNhSW5zdGFuY2UuX2tleSA9IFN0cmluZyhpKTtcbiAgICAgICAgdmFyIGdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbFtpXTsgfTtcbiAgICAgICAgdmFyIHNldHRlciA9IGZ1bmN0aW9uIChuZXdWYWwpIHsgdmFsW2ldID0gbmV3VmFsOyB9O1xuICAgICAgICB2YXIgcmVzdWx0ID0gaXRzYUluc3RhbmNlLnZhbGlkYXRlLmFwcGx5KGl0c2FJbnN0YW5jZSwgW2dldHRlciwgc2V0dGVyXSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiZXR3ZWVuQnVpbGRlcihtaW4sIG1heCwgaW5jbHVzaXZlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBiZXR3ZWVuQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAoaW5jbHVzaXZlKSB7XG4gICAgICByZXR1cm4gdmFsID49IG1pbiAmJiB2YWwgPD0gbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBiZXR3ZWVuIG1pbmltdW0gYW5kIG1heGltdW0gKGluY2x1c2l2ZSkuXCI7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdmFsID4gbWluICYmIHZhbCA8IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgYmV0d2VlbiBtaW5pbXVtIGFuZCBtYXhpbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBib29sZWFuQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGJvb2xlYW5DaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwiYm9vbGVhblwiO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBhIGJvb2xlYW4uXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udGFpbnNCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjb250YWluc0NoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5pbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgdmFyIHZhbGlkID0gaGFzSW5kZXhPZiAmJiB2YWwuaW5kZXhPZih2YWx1ZSkgPiAtMTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGN1c3RvbUJ1aWxkZXIodmFsaWRhdG9yRnVuY3Rpb24pIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApe1xuICAgIHRocm93IFwiTm8gdmFsaWRhdG9yRnVuY3Rpb24gZ2l2ZW4gaW4gaXRzYS5jdXN0b20oLi4uKVwiO1xuICB9XG5cbiAgcmV0dXJuIHZhbGlkYXRvckZ1bmN0aW9uLmJpbmQodGhpcyk7XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGF0ZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBkYXRlQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgY2xhc3NUeXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gICAgdmFyIHZhbGlkID0gY2xhc3NUeXBlID09PSBcIltvYmplY3QgRGF0ZV1cIiAmJiBpc0Zpbml0ZSh2YWwpO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIkludmFsaWQgZGF0ZVwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdEJ1aWxkZXIgKGRlZmF1bHRWYWwpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBcIk5vIGRlZmF1bHQgdmFsdWUgd2FzIGdpdmVuIGluIGAuZGVmYXVsdCguLi4pYC5cIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBkZWZhdWx0UnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIC8vbWFrZSBzdXJlIHRoZXJlIGlzIGEgcGFyZW50IG9iamVjdFxuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAuZGVmYXVsdCguLi4pYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3QuXCI7XG4gICAgfVxuXG4gICAgdmFyIGlzRmFsc3kgPSAhdmFsO1xuICAgIGlmIChpc0ZhbHN5KXtcbiAgICAgIHNldHRlcih0eXBlb2YgZGVmYXVsdFZhbCA9PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsKCkgOiBkZWZhdWx0VmFsKTtcbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHROb3dCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGRlZmF1bHROb3dSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHtcbiAgICAgIHRocm93IFwiYC5kZWZhdWx0Tm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBpZiAoIXZhbCkge1xuICAgICAgc2V0dGVyKG5ldyBEYXRlKCkpO1xuICAgIH1cbiAgfTtcbn07IiwiXG52YXIgcnggPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbWFpbEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbWFpbENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHJ4LnRlc3QodmFsKSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBhbiBlbWFpbCBhZGRyZXNzLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW1wdHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZW1wdHlDaGVja2VyKHZhbCkge1xuICAgIHZhciBjbGFzc1R5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcblxuICAgIGlmIChjbGFzc1R5cGUgPT09IFwiW29iamVjdCBTdHJpbmddXCIpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoID09PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICByZXR1cm4gdmFsLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChjbGFzc1R5cGUgPT09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICAgIHZhciBudW1iZXJPZkZpZWxkcyA9IDA7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIG51bWJlck9mRmllbGRzICs9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVtYmVyT2ZGaWVsZHMgPT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBlbXB0eSwgYnV0IG51bWJlciBvZiBmaWVsZHMgaXM6IFwiK251bWJlck9mRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBcIlR5cGUgY2Fubm90IGJlIGVtcHR5OiBcIitjbGFzc1R5cGU7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5kc1dpdGhCdWlsZGVyKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBlbmRzV2l0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5sYXN0SW5kZXhPZikgfHwgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpO1xuICAgIGlmICghaGFzSW5kZXhPZikge1xuICAgICAgcmV0dXJuIFwiRGF0YSBoYXMgbm8gbGFzdEluZGV4T2YsIHNvIHRoZXJlJ3Mgbm8gd2F5IHRvIGNoZWNrIGAuZW5kc1dpdGgoKWAuXCI7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHZhbC5sYXN0SW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09PSAtMSl7XG4gICAgICByZXR1cm4gXCJEYXRhIGRvZXMgbm90IGNvbnRhaW4gdGhlIHZhbHVlLlwiO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZUxlbmd0aCA9ICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHx8IDA7XG4gICAgdmFsdWVMZW5ndGggPSB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gdmFsdWVMZW5ndGggOiAxO1xuICAgIC8vb3V0c2lkZSB2YWx1ZSBpcyBhIHN0cmluZyBhbmQgaW5zaWRlIHZhbHVlIGlzIGFuIGVtcHR5IHN0cmluZz8gdGhhdCdzIGV2ZXJ5d2hlcmVcbiAgICBpZiAodmFsdWVMZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgdmFsaWQgPSBpbmRleCA9PT0gKHZhbC5sZW5ndGggLSB2YWx1ZUxlbmd0aCk7XG4gICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiRGF0YSBjb250YWlucyB0aGUgdmFsdWUsIGJ1dCBkb2VzIG5vdCBlbmQgd2l0aCBpdC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlcXVhbEJ1aWxkZXIoZXhhbXBsZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBjb21wYXJpc29uIG9iamVjdCBnaXZlbiBpbiBpdHNhLmVxdWFsKC4uLilcIjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBlcXVhbENoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gZXhhbXBsZSA9PT0gdmFsO1xuICAgIHJldHVybiB2YWxpZCA/IG51bGwgOiBcIlZhbHVlIGRpZCBub3QgcGFzcyBlcXVhbGl0eSB0ZXN0LlwiO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZhbHNlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZhbHNlQ2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID09PSBmYWxzZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgZmFsc2VgLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmFsc3lCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZmFsc3lDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiAhdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IGZhbHN5LlwiO1xuICB9O1xufTtcblxuIiwiXG52YXIgcnggPSAvXlswLTlhLWZdKiQvaTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoZXhCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gaGV4Q2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgaWYgKFtcInN0cmluZ1wiLCBcIm51bWJlclwiXS5pbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgICAgcmV0dXJuIFwiVmFsdWUgc2hvdWxkIGJlIGhleCwgYnV0IGlzbid0IGEgc3RyaW5nIG9yIG51bWJlci5cIjtcbiAgICB9XG4gICAgcmV0dXJuIHJ4LnRlc3QodmFsKSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBoZXguXCI7XG4gIH07XG59O1xuXG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuICBcImFscGhhbnVtZXJpY1wiOiByZXF1aXJlKCcuL2FscGhhbnVtZXJpYycpLFxuICBcImFueVwiOiByZXF1aXJlKCcuL2FueScpLFxuICBcImFycmF5XCI6IHJlcXVpcmUoJy4vYXJyYXknKSxcbiAgXCJhcnJheU9mXCI6IHJlcXVpcmUoJy4vYXJyYXlPZicpLFxuICBcImJldHdlZW5cIjogcmVxdWlyZSgnLi9iZXR3ZWVuJyksXG4gIFwiYm9vbGVhblwiOiByZXF1aXJlKCcuL2Jvb2xlYW4nKSxcbiAgXCJjdXN0b21cIjogcmVxdWlyZSgnLi9jdXN0b20nKSxcbiAgXCJjb250YWluc1wiOiByZXF1aXJlKCcuL2NvbnRhaW5zJyksXG4gIFwiZGF0ZVwiOiByZXF1aXJlKCcuL2RhdGUnKSxcbiAgXCJkZWZhdWx0XCI6IHJlcXVpcmUoJy4vZGVmYXVsdCcpLFxuICBcImRlZmF1bHROb3dcIjogcmVxdWlyZSgnLi9kZWZhdWx0Tm93JyksXG4gIFwiZW1haWxcIjogcmVxdWlyZSgnLi9lbWFpbCcpLFxuICBcImVtcHR5XCI6IHJlcXVpcmUoJy4vZW1wdHknKSxcbiAgXCJlbmRzV2l0aFwiOiByZXF1aXJlKCcuL2VuZHNXaXRoJyksXG4gIFwiZXF1YWxcIjogcmVxdWlyZSgnLi9lcXVhbCcpLFxuICBcImZhbHNlXCI6IHJlcXVpcmUoJy4vZmFsc2UnKSxcbiAgXCJmYWxzeVwiOiByZXF1aXJlKCcuL2ZhbHN5JyksXG4gIFwiaGV4XCI6IHJlcXVpcmUoJy4vaGV4JyksXG4gIFwiaW50ZWdlclwiOiByZXF1aXJlKCcuL2ludGVnZXInKSxcbiAgXCJqc29uXCI6IHJlcXVpcmUoJy4vanNvbicpLFxuICBcImxlblwiOiByZXF1aXJlKCcuL2xlbicpLFxuICBcImxvd2VyY2FzZVwiOiByZXF1aXJlKCcuL2xvd2VyY2FzZScpLFxuICBcIm1hdGNoZXNcIjogcmVxdWlyZSgnLi9tYXRjaGVzJyksXG4gIFwibWF4TGVuZ3RoXCI6IHJlcXVpcmUoJy4vbWF4TGVuZ3RoJyksXG4gIFwibWluTGVuZ3RoXCI6IHJlcXVpcmUoJy4vbWluTGVuZ3RoJyksXG4gIFwibmFuXCI6IHJlcXVpcmUoJy4vbmFuJyksXG4gIFwibm90RW1wdHlcIjogcmVxdWlyZSgnLi9ub3RFbXB0eScpLFxuICBcIm51bGxcIjogcmVxdWlyZSgnLi9udWxsJyksXG4gIFwibnVtYmVyXCI6IHJlcXVpcmUoJy4vbnVtYmVyJyksXG4gIFwib2JqZWN0XCI6IHJlcXVpcmUoJy4vb2JqZWN0JyksXG4gIFwib3ZlclwiOiByZXF1aXJlKCcuL292ZXInKSxcbiAgXCJzdGFydHNXaXRoXCI6IHJlcXVpcmUoJy4vc3RhcnRzV2l0aCcpLFxuICBcInN0cmluZ1wiOiByZXF1aXJlKCcuL3N0cmluZycpLFxuICBcInRvXCI6IHJlcXVpcmUoJy4vdG8nKSxcbiAgXCJ0b0RhdGVcIjogcmVxdWlyZSgnLi90b0RhdGUnKSxcbiAgXCJ0b0Zsb2F0XCI6IHJlcXVpcmUoJy4vdG9GbG9hdCcpLFxuICBcInRvSW50ZWdlclwiOiByZXF1aXJlKCcuL3RvSW50ZWdlcicpLFxuICBcInRvTG93ZXJjYXNlXCI6IHJlcXVpcmUoJy4vdG9Mb3dlcmNhc2UnKSxcbiAgXCJ0b05vd1wiOiByZXF1aXJlKCcuL3RvTm93JyksXG4gIFwidG9TdHJpbmdcIjogcmVxdWlyZSgnLi90b1N0cmluZycpLFxuICBcInRvVHJpbW1lZFwiOiByZXF1aXJlKCcuL3RvVHJpbW1lZCcpLFxuICBcInRvVXBwZXJjYXNlXCI6IHJlcXVpcmUoJy4vdG9VcHBlcmNhc2UnKSxcbiAgXCJ0cnVlXCI6IHJlcXVpcmUoJy4vdHJ1ZScpLFxuICBcInRydXRoeVwiOiByZXF1aXJlKCcuL3RydXRoeScpLFxuICBcInVuZGVmaW5lZFwiOiByZXF1aXJlKCcuL3VuZGVmaW5lZCcpLFxuICBcInVuZGVyXCI6IHJlcXVpcmUoJy4vdW5kZXInKSxcbiAgXCJ1bmlxdWVcIjogcmVxdWlyZSgnLi91bmlxdWUnKSxcbiAgXCJ1cHBlcmNhc2VcIjogcmVxdWlyZSgnLi91cHBlcmNhc2UnKVxufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGludGVnZXJCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gaW50ZWdlckNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIlxuICAgICAgICAmJiBpc05hTih2YWwpID09PSBmYWxzZVxuICAgICAgICAmJiBbTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFldLmluZGV4T2YodmFsKSA9PT0gLTFcbiAgICAgICAgJiYgdmFsICUgMSA9PT0gMDtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIGludGVnZXJcIjtcbiAgfTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ganNvbkJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBqc29uQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIFwiSlNPTiBtdXN0IGJlIGEgc3RyaW5nLlwiO1xuICAgIH1cblxuICAgIHRyeXtcbiAgICAgIEpTT04ucGFyc2UodmFsKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1jYXRjaChlKXtcbiAgICAgIHJldHVybiBcIlZhbHVlIGlzIGEgbm90IHZhbGlkIEpTT04gc3RyaW5nLlwiO1xuICAgIH1cbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxlbkJ1aWxkZXIoZXhhY3RPck1pbiwgbWF4KSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIHZhciB2YWxpZGF0aW9uVHlwZSA9IFwidHJ1dGh5XCI7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkgdmFsaWRhdGlvblR5cGUgPSBcImV4YWN0XCI7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMikgdmFsaWRhdGlvblR5cGUgPSBcImJldHdlZW5cIjtcblxuICByZXR1cm4gZnVuY3Rpb24gbGVuQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgbGVuZ3RoID0gKHZhbCB8fCAodHlwZW9mIHZhbCkgPT09IFwic3RyaW5nXCIpID8gdmFsLmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsaWRhdGlvblR5cGUgPT09IFwidHJ1dGh5XCIpe1xuICAgICAgcmV0dXJuIGxlbmd0aCA/IG51bGwgOiBcIkxlbmd0aCBpcyBub3QgdHJ1dGh5LlwiO1xuICAgIH1lbHNlIGlmICh2YWxpZGF0aW9uVHlwZSA9PT0gXCJleGFjdFwiKXtcbiAgICAgIHJldHVybiBsZW5ndGggPT09IGV4YWN0T3JNaW4gPyBudWxsIDogXCJMZW5ndGggaXMgbm90IGV4YWN0bHk6IFwiK2V4YWN0T3JNaW47XG4gICAgfWVsc2UgaWYgKHZhbGlkYXRpb25UeXBlID09PSBcImJldHdlZW5cIil7XG4gICAgICB2YXIgdmFsaWQgPSBsZW5ndGggPj0gZXhhY3RPck1pbiAmJiBsZW5ndGggPD0gbWF4O1xuICAgICAgcmV0dXJuIHZhbGlkID8gbnVsbCA6IFwiTGVuZ3RoIGlzIG5vdCBiZXR3ZWVuIFwiK2V4YWN0T3JNaW4gK1wiIGFuZCBcIiArIG1heDtcbiAgICB9XG4gIH07XG59O1xuIiwiXG52YXIgcnggPSAvW0EtWl0vO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvd2VyY2FzZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBsb3dlcmNhc2VDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgJiYgIXJ4LnRlc3QodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBjb250YWlucyB1cHBlcmNhc2UgY2hhcmFjdGVycy5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1hdGNoZXNCdWlsZGVyKHJ4KSB7XG4gIGlmIChyeCBpbnN0YW5jZW9mIFJlZ0V4cCA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBcImAubWF0Y2hlcyguLi4pYCByZXF1aXJlcyBhIHJlZ2V4cFwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIG1hdGNoZXNDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHJ4LnRlc3QodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBkb2VzIG5vdCBtYXRjaCByZWdleHAuXCI7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1heCkge1xuICBpZiAodHlwZW9mIG1heCAhPSBcIm51bWJlclwiKSB7XG4gICAgdGhyb3cgXCJJbnZhbGlkIG1heGltdW0gaW4gbWF4TGVuZ3RoOiBcIittYXg7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgdmFyIGxlbmd0aCA9ICh2YWwgfHwgdHlwZSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoIDw9IG1heDtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgbG9nczogW3RoaXMuX2J1aWxkTG9nKFwibWF4TGVuZ3RoXCIsIFwiTGVuZ3RoIGlzIFwiK2xlbmd0aCtcIiwgbWF4IGlzIFwiK21heCwgdmFsaWQpXSxcbiAgICB9O1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1pbkxlbmd0aEJ1aWxkZXIobWluKSB7XG4gIGlmICh0eXBlb2YgbWluICE9IFwibnVtYmVyXCIpIHtcbiAgICB0aHJvdyBcIkludmFsaWQgbWluaW11bSBpbiBtaW5MZW5ndGg6IFwiK21pbjtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gbWluTGVuZ3RoQ2hlY2tlcih2YWwpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG4gICAgdmFyIGxlbmd0aCA9ICh2YWwgfHwgdHlwZSA9PT0gXCJzdHJpbmdcIikgPyB2YWwubGVuZ3RoIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID49IG1pbjtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogKFwiTGVuZ3RoIGlzIFwiK2xlbmd0aCtcIiwgbWluIGlzIFwiK21pbik7XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbmFuQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5hbkNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIGlzTmFOKHZhbCkgPyBudWxsIDogXCJWYWx1ZSBpcyBub3QgTmFOLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm90RW1wdHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbm90RW1wdHlDaGVja2VyKHZhbCkge1xuICAgIHZhciBjbGFzc1R5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcblxuICAgIGlmIChjbGFzc1R5cGUgPT09IFwiW29iamVjdCBTdHJpbmddXCIpIHtcbiAgICAgIHJldHVybiB2YWwubGVuZ3RoICE9PSAwID8gbnVsbCA6IFwiRXhwZWN0ZWQgbm90IGVtcHR5LCBidXQgbGVuZ3RoIGlzOiBcIit2YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChjbGFzc1R5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgcmV0dXJuIHZhbC5sZW5ndGggIT09IDAgPyBudWxsIDogXCJFeHBlY3RlZCBub3QgZW1wdHksIGJ1dCBsZW5ndGggaXM6IFwiK3ZhbC5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzVHlwZSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgICAgdmFyIG51bWJlck9mRmllbGRzID0gMDtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgICAgbnVtYmVyT2ZGaWVsZHMgKz0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW1iZXJPZkZpZWxkcyAhPT0gMCA/IG51bGwgOiBcIkV4cGVjdGVkIG5vdCBlbXB0eSwgYnV0IG51bWJlciBvZiBmaWVsZHMgaXM6IFwiK251bWJlck9mRmllbGRzO1xuICAgIH1cblxuICAgIHJldHVybiBcIlR5cGUgY2Fubm90IGJlIG5vdC1lbXB0eTogXCIrY2xhc3NUeXBlO1xuICB9O1xufTtcbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG51bGxCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gbnVsbENoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gbnVsbCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBudWxsLlwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbnVtYmVyQnVpbGRlcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG51bWJlckNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHZhbGlkID0gdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIlxuICAgICAgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2VcbiAgICAgICYmIFtOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWV0uaW5kZXhPZih2YWwpID09PSAtMTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJJbnZhbGlkIG51bWJlclwiO1xuICB9O1xufTtcblxuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4YW1wbGUsIGFsbG93RXh0cmFGaWVsZHMpIHtcbiAgdmFyIGFyZ3MgPSBbXS5jb25jYXQuYXBwbHkoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgYWxsb3dFeHRyYUZpZWxkcyA9IGFsbG93RXh0cmFGaWVsZHMgfHwgYXJncy5sZW5ndGggPT09IDA7XG5cbiAgLypcbiAgICogVGhlIGV4YW1wbGUgaXMgYW4gb2JqZWN0IHdoZXJlIHRoZSBrZXlzIGFyZSB0aGUgZmllbGQgbmFtZXNcbiAgICogYW5kIHRoZSB2YWx1ZXMgYXJlIGl0c2EgaW5zdGFuY2VzLlxuICAgKiBBc3NpZ24gcGFyZW50IGluc3RhbmNlIGFuZCBrZXlcbiAgICovXG4gIGZvcih2YXIga2V5IGluIGV4YW1wbGUpIHtcbiAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG4gICAgdmFyIGl0c2FJbnN0YW5jZSA9IHRoaXMuX2NvbnZlcnRWYWxpZGF0b3JUb0l0c2FJbnN0YW5jZShleGFtcGxlW2tleV0pO1xuICAgIGV4YW1wbGVba2V5XSA9IGl0c2FJbnN0YW5jZTtcbiAgICBpdHNhSW5zdGFuY2UuX3BhcmVudCA9IHRoaXM7XG4gICAgaXRzYUluc3RhbmNlLl9rZXkgPSBrZXk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgIHZhciByZXN1bHRzID0gW107XG5cbiAgICAvLyB0eXBlb2YgW10sIG51bGwsIGV0YyBhcmUgb2JqZWN0LCBzbyB1c2UgdGhpcyBjaGVjayBmb3IgYWN0dWFsIG9iamVjdHNcbiAgICB2YXIgcHJvdG90eXBlU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XG4gICAgdmFyIHZhbGlkID0gcHJvdG90eXBlU3RyID09PSBcIltvYmplY3QgT2JqZWN0XVwiO1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICB2YWxpZDogdmFsaWQsXG4gICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJvYmplY3RcIiwgXCJUeXBlIHdhczogXCIrcHJvdG90eXBlU3RyLCB2YWxpZCldXG4gICAgfSk7XG4gICAgaWYgKHZhbGlkID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIHJlc3VsdHNbMF07XG4gICAgfVxuXG4gICAgLy9leHRyYSBmaWVsZHMgbm90IGFsbG93ZWQ/XG4gICAgaWYgKGFsbG93RXh0cmFGaWVsZHMgPT09IGZhbHNlKSB7XG4gICAgICB2YXIgaW52YWxpZEZpZWxkcyA9IFtdO1xuICAgICAgZm9yKHZhciBrZXkgaW4gdmFsKSB7XG4gICAgICAgIGlmIChrZXkgaW4gZXhhbXBsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBpbnZhbGlkRmllbGRzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbGlkOiBmYWxzZSxcbiAgICAgICAgICBsb2dzOiBbdGhpcy5fYnVpbGRMb2coXCJvYmplY3RcIiwgXCJVbmV4cGVjdGVkIGZpZWxkczogXCIraW52YWxpZEZpZWxkcy5qb2luKCksIGZhbHNlKV1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IodmFyIGtleSBpbiBleGFtcGxlKSB7XG4gICAgICBpZiAoIWV4YW1wbGUuaGFzT3duUHJvcGVydHkoa2V5KSkgY29udGludWU7XG5cbiAgICAgIHZhciBpdHNhSW5zdGFuY2UgPSBleGFtcGxlW2tleV07XG4gICAgICB2YXIgZ2V0dGVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsW2tleV07IH07XG4gICAgICB2YXIgc2V0dGVyID0gZnVuY3Rpb24gKG5ld1ZhbCkgeyB2YWxba2V5XSA9IG5ld1ZhbDsgfTtcbiAgICAgIHZhciByZXN1bHQgPSBpdHNhSW5zdGFuY2UudmFsaWRhdGUuYXBwbHkoaXRzYUluc3RhbmNlLCBbZ2V0dGVyLCBzZXR0ZXJdKTtcbiAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb21iaW5lUmVzdWx0cyhyZXN1bHRzKTtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvdmVyQnVpbGRlcihtaW4sIGluY2x1c2l2ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gb3ZlckNoZWNrZXIodmFsKSB7XG4gICAgaWYgKGluY2x1c2l2ZSkge1xuICAgICAgcmV0dXJuIHZhbCA+PSBtaW4gPyBudWxsIDogXCJWYWx1ZSB3YXMgbm90IG92ZXIgdGhlIG1pbmltdW0gKGluY2x1c2l2ZSkuXCI7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdmFsID4gbWluID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCBvdmVyIHRoZSBtaW5pbXVtIChleGNsdXNpdmUpLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdGFydHNXaXRoQnVpbGRlcih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gc3RhcnRzV2l0aENoZWNrZXIodmFsKSB7XG4gICAgdmFyIGhhc0luZGV4T2YgPSAodmFsICYmIHZhbC5pbmRleE9mKSB8fCAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIik7XG4gICAgaWYgKCFoYXNJbmRleE9mKSB7XG4gICAgICByZXR1cm4gXCJEYXRhIGhhcyBubyBpbmRleE9mLCBzbyB0aGVyZSdzIG5vIHdheSB0byBjaGVjayBgLnN0YXJ0c1dpdGgoKWAuXCI7XG4gICAgfVxuICAgIHZhciBpbmRleCA9IHZhbC5pbmRleE9mKHZhbHVlKTtcbiAgICBpZiAoaW5kZXggPT09IC0xKXtcbiAgICAgIHJldHVybiBcIkRhdGEgZG9lcyBub3QgY29udGFpbiB0aGUgdmFsdWUuXCI7XG4gICAgfVxuICAgIHJldHVybiBpbmRleCA9PT0gMCA/IG51bGwgOiBcIkRhdGEgY29udGFpbnMgdGhlIHZhbHVlLCBidXQgZG9lcyBub3Qgc3RhcnQgd2l0aCBpdC5cIjtcbiAgfTtcbn07XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICAgIHZhciB2YWxpZCA9IHR5cGUgPT09IFwic3RyaW5nXCI7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgIGxvZ3M6IFt0aGlzLl9idWlsZExvZyhcInN0cmluZ1wiLCBcIkV4cGVjdGVkIGEgc3RyaW5nLCBidXQgZm91bmQgYSBcIit0eXBlLCB2YWxpZCldLFxuICAgIH07XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9CdWlsZGVyICh2YWx1ZU9yR2V0dGVyKSB7XG4gIHZhciBhcmdzID0gW10uY29uY2F0LmFwcGx5KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCl7XG4gICAgdGhyb3cgXCJObyBkZWZhdWx0IHZhbHVlIHdhcyBnaXZlbiBpbiBgLnRvKC4uLilgLlwiO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHRvUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB7XG4gICAgICB0aHJvdyBcImAudG8oLi4uKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuICAgIH1cblxuICAgIHNldHRlcih0eXBlb2YgdmFsdWVPckdldHRlciA9PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZU9yR2V0dGVyKCkgOiB2YWx1ZU9yR2V0dGVyKTtcbiAgfTtcbn07IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvRGF0ZUJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9EYXRlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9EYXRlKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIGlmICghdmFsKSB7XG4gICAgICByZXR1cm4gXCJVbndpbGxpbmcgdG8gcGFyc2UgZmFsc3kgdmFsdWVzLlwiO1xuICAgIH1cblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICByZXR1cm4gXCJVbndpbGxpbmcgdG8gcGFyc2UgYXJyYXlzLlwiO1xuICAgIH1cblxuICAgIHZhciBkYXRlID0gbmV3IERhdGUodmFsKTtcbiAgICBpZiAoaXNGaW5pdGUoZGF0ZSkpIHtcbiAgICAgIHNldHRlcihkYXRlKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBcIlVuYWJsZSB0byBwYXJzZSBkYXRlLlwiO1xuICAgIH1cbiAgfTtcbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9GbG9hdEJ1aWxkZXIgKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdG9GbG9hdFJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvRmxvYXQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gcGFyc2VGbG9hdCh2YWwpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBmbG9hdC5cIjtcbiAgICB9ZWxzZXtcbiAgICAgIHNldHRlcihuZXdWYWx1ZSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9JbnRlZ2VyQnVpbGRlciAocmFkaXgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSW50ZWdlclJ1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvSW50ZWdlcigpYCBtYXkgbm90IGJlIHVzZWQgdW5sZXNzIGl0IGlzIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkuXCI7XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBwYXJzZUludCh2YWwsIHR5cGVvZiByYWRpeCA9PT0gXCJ1bmRlZmluZWRcIiA/IDEwIDogcmFkaXgpO1xuICAgIGlmICh2YWwgPT09IG5ld1ZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzTmFOKG5ld1ZhbHVlKSkge1xuICAgICAgcmV0dXJuIFwiVW5hYmxlIHRvIGNvbnZlcnQgZGF0YSB0byBpbnRlZ2VyLlwiO1xuICAgIH1lbHNle1xuICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9Mb3dlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvTG93ZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9Mb3dlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvTm93QnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b05vd1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikge1xuICAgICAgdGhyb3cgXCJgLnRvTm93KClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcbiAgICB9XG5cbiAgICBzZXR0ZXIobmV3IERhdGUoKSk7XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvU3RyaW5nQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1N0cmluZ1J1bm5lciAodmFsLCBzZXR0ZXIpIHtcbiAgICBpZiAoIXNldHRlcikgdGhyb3cgXCJgLnRvU3RyaW5nKClgIG1heSBub3QgYmUgdXNlZCB1bmxlc3MgaXQgaXMgd2l0aGluIGFuIG9iamVjdCBvciBhcnJheS5cIjtcblxuICAgIHZhciBuZXdWYWx1ZSA9IFN0cmluZyh2YWwpO1xuICAgIGlmICh2YWwgIT09IG5ld1ZhbHVlKSB7XG4gICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9UcmltbWVkQnVpbGRlciAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0b1RyaW1tZWRSdW5uZXIgKHZhbCwgc2V0dGVyKSB7XG4gICAgaWYgKCFzZXR0ZXIpIHRocm93IFwiYC50b1RyaW1tZWQoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50cmltKCk7XG4gICAgICBpZiAodmFsICE9PSBuZXdWYWx1ZSkge1xuICAgICAgICBzZXR0ZXIobmV3VmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07IiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9VcHBlcmNhc2VCdWlsZGVyICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvVXBwZXJjYXNlUnVubmVyICh2YWwsIHNldHRlcikge1xuICAgIGlmICghc2V0dGVyKSB0aHJvdyBcImAudG9VcHBlcmNhc2UoKWAgbWF5IG5vdCBiZSB1c2VkIHVubGVzcyBpdCBpcyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5LlwiO1xuXG4gICAgaWYgKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHZhbC50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHZhbCAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgc2V0dGVyKG5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRydWVCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1ZUNoZWNrZXIodmFsKSB7XG4gICAgcmV0dXJuIHZhbCA9PT0gdHJ1ZSA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCBgdHJ1ZWAuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cnV0aHlCdWlsZGVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gdHJ1dGh5Q2hlY2tlcih2YWwpIHtcbiAgICByZXR1cm4gdmFsID8gbnVsbCA6IFwiVmFsdWUgaXMgbm90IHRydXRoeS5cIjtcbiAgfTtcbn07XG5cbiIsIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVuZGVmaW5lZEJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB1bmRlZmluZWRDaGVja2VyKHZhbCkge1xuICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBcIlZhbHVlIGlzIG5vdCB1bmRlZmluZWQuXCI7XG4gIH07XG59O1xuXG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB1bmRlckJ1aWxkZXIobWF4LCBpbmNsdXNpdmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuZGVyQ2hlY2tlcih2YWwpIHtcbiAgICBpZiAoaW5jbHVzaXZlKSB7XG4gICAgICByZXR1cm4gdmFsIDw9IG1heCA/IG51bGwgOiBcIlZhbHVlIHdhcyBub3QgdW5kZXIgdGhlIG1heGltdW0gKGluY2x1c2l2ZSkuXCI7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gdmFsIDwgbWF4ID8gbnVsbCA6IFwiVmFsdWUgd2FzIG5vdCB1bmRlciB0aGUgbWF4aW11bSAoZXhjbHVzaXZlKS5cIjtcbiAgICB9XG4gIH07XG59O1xuIiwiXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdW5pcXVlQnVpbGRlcihnZXR0ZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVuaXF1ZUNoZWNrZXIodmFsKSB7XG4gICAgdmFyIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKTtcbiAgICB2YXIgdmFsaWRUeXBlcyA9IFtcIltvYmplY3QgQXJyYXldXCIsIFwiW29iamVjdCBPYmplY3RdXCIsIFwiW29iamVjdCBTdHJpbmddXCJdO1xuICAgIHZhciBpc1R5cGVWYWxpZCA9IHZhbGlkVHlwZXMuaW5kZXhPZih0eXBlKSA+IC0xO1xuICAgIGlmICghaXNUeXBlVmFsaWQpIHtcbiAgICAgIHJldHVybiBcIlVuYWJsZSB0byBjaGVjayB1bmlxdWVuZXNzIG9uIHRoaXMgdHlwZSBvZiBkYXRhLlwiO1xuICAgIH1cblxuICAgIHZhciBnZXR0ZXJUeXBlID0gXCJcIjtcbiAgICBpZiAodHlwZW9mIGdldHRlciA9PT0gXCJmdW5jdGlvblwiKSB7IGdldHRlclR5cGUgPSBcImZ1bmN0aW9uXCI7IH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZ2V0dGVyICE9PSBcInVuZGVmaW5lZFwiKSB7IGdldHRlclR5cGUgPSBcInBsdWNrXCI7IH1cblxuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiB2YWwpIHtcbiAgICAgIHZhciBpdGVtID0gdmFsW2tleV07XG4gICAgICBpZiAoZ2V0dGVyVHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGl0ZW0gPSBnZXR0ZXIoaXRlbSk7XG4gICAgICB9XG4gICAgICBpZiAoZ2V0dGVyVHlwZSA9PT0gXCJwbHVja1wiKSB7XG4gICAgICAgIGl0ZW0gPSBpdGVtW2dldHRlcl07XG4gICAgICB9XG4gICAgICB2YXIgYWxyZWFkeUZvdW5kID0gaXRlbXMuaW5kZXhPZihpdGVtKSA+IC0xO1xuICAgICAgaWYgKGFscmVhZHlGb3VuZCkge1xuICAgICAgICByZXR1cm4gXCJJdGVtcyBhcmUgbm90IHVuaXF1ZS5cIjtcbiAgICAgIH1cbiAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xufTtcblxuIiwiXG52YXIgcnggPSAvW2Etel0vO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVwcGVyY2FzZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiB1cHBlcmNhc2VDaGVja2VyKHZhbCkge1xuICAgIHZhciB2YWxpZCA9IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgJiYgIXJ4LnRlc3QodmFsKTtcbiAgICByZXR1cm4gdmFsaWQgPyBudWxsIDogXCJWYWx1ZSBpcyBjb250YWlucyBsb3dlcmNhc2UgY2hhcmFjdGVycy5cIjtcbiAgfTtcbn07XG5cbiJdfQ==
