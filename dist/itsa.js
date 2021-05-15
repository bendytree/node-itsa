
/**
 * @license
 * itsa 2.1.39
 * Copyright 2021 Josh Wright <https://www.joshwright.com> 
 * MIT LICENSE
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Itsa = {}));
}(this, (function (exports) { 'use strict';

  function primitiveToItsa(val) {
      if (val instanceof Itsa) {
          return val;
      }
      else if (typeof val === 'function') {
          return itsa.constructorIs(val);
      }
      else {
          return itsa.equal(val);
      }
  }

  class ItsaAny {
      any(...options) {
          const schemas = options.flat().map(x => primitiveToItsa(x));
          const settings = { schemas };
          this.predicates.push({ id: 'any', settings });
          return this;
      }
  }
  const validate = {
      id: 'any',
      validate: (context, settings) => {
          const { key, val, parent, validation, exists, result } = context;
          const { schemas } = settings;
          if (schemas.length === 0)
              return;
          for (const subSchema of schemas) {
              const subResult = subSchema._validate({
                  key,
                  parent,
                  val,
                  exists,
                  settings: validation,
                  path: context.path,
              });
              if (subResult.ok) {
                  return;
              }
          }
          result.addError(`No schemas matched.`);
      }
  };
  Itsa.extend(ItsaAny, validate);

  class ItsaAnything {
      anything() {
          this.predicates.push({ id: 'anything', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaAnything, {
      id: 'anything',
      validate: (context) => {
      }
  });

  class ItsaArray {
      array(example) {
          const settings = { example: example ? primitiveToItsa(example) : null };
          this.predicates.push({ id: 'array', settings });
          return this;
      }
  }
  Itsa.extend(ItsaArray, {
      id: 'array',
      validate: (context, settings) => {
          const { val, validation, exists, result, type } = context;
          const { example } = settings;
          if (!Array.isArray(val))
              return result.addError(`Expected array but found ${type}`);
          if (!example)
              return;
          if (!val.length)
              return;
          for (let key = 0; key < val.length; key++) {
              const subVal = val[key];
              const subResult = example._validate({
                  key,
                  parent: val,
                  val: subVal,
                  exists,
                  settings: validation,
                  path: [...context.path, key],
              });
              result.combine(subResult);
          }
      }
  });

  class ItsaBetween {
      between(min, max, extraSettings = {}) {
          const settings = extraSettings;
          settings.min = min;
          settings.max = max;
          this.predicates.push({ id: 'between', settings: settings });
          return this;
      }
  }
  Itsa.extend(ItsaBetween, {
      id: 'between',
      validate: (context, settings) => {
          const { val, result } = context;
          const { min, max } = settings;
          const inclusive = settings.inclusive ?? true;
          const isTooLow = inclusive ? (val < min) : (val <= min);
          if (isTooLow)
              result.addError(`Value cannot be under ${min}`);
          const isTooHigh = inclusive ? (val > max) : (val >= max);
          if (isTooHigh)
              result.addError(`Value cannot be above ${max}`);
      }
  });

  class ItsaBoolean {
      boolean() {
          this.predicates.push({ id: 'boolean', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaBoolean, {
      id: 'boolean',
      validate: (context) => {
          const { type, result } = context;
          if (type !== 'boolean')
              result.addError(`Expected bool but found ${type}`);
      }
  });

  class ItsaConstructor {
      constructorIs(cls) {
          const settings = { cls };
          this.predicates.push({ id: 'constructor', settings });
          return this;
      }
  }
  Itsa.extend(ItsaConstructor, {
      id: 'constructor',
      validate: (context, settings) => {
          const { val, result } = context;
          const isMatch = val !== null && val !== undefined && val.constructor === settings.cls;
          if (!isMatch)
              return result.addError(`Expected to be ${settings.cls}`);
      }
  });

  class ItsaConvert {
      convert(converter) {
          const settings = { converter };
          this.predicates.push({ id: 'convert', settings });
          return this;
      }
      to(converter) {
          const settings = { converter };
          this.predicates.push({ id: 'convert', settings });
          return this;
      }
  }
  Itsa.extend(ItsaConvert, {
      id: 'convert',
      validate: (context, settings) => {
          const { val, setVal, result } = context;
          const { converter } = settings;
          if (typeof converter !== 'function')
              return;
          try {
              const newVal = converter(val);
              setVal(newVal);
          }
          catch (e) {
              result.addError(e);
          }
      }
  });

  class ItsaDate {
      date() {
          this.predicates.push({ id: 'date', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaDate, {
      id: 'date',
      validate: (context) => {
          const { val, result } = context;
          const type = Object.prototype.toString.call(val);
          if (type !== "[object Date]") {
              return result.addError(`Expected date but found ${type}`);
          }
          if (!isFinite(val)) {
              result.addError(`Date is not valid`);
          }
      }
  });

  class ItsaDefault {
      default(val, settings = {}) {
          settings.val = val;
          this.predicates.push({ id: 'default', settings });
          return this;
      }
      defaultNow() {
          this.predicates.push({ id: 'defaultNow', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaDefault, ...[
      {
          id: 'default',
          validate: (context, settings) => {
              const { val, setVal } = context;
              const falsy = settings.falsy ?? false;
              const doReplace = falsy ? !val : (val === null || val === undefined);
              if (doReplace) {
                  setVal(settings.val);
              }
          }
      },
      {
          id: 'defaultNow',
          validate: (context) => {
              const { val, setVal } = context;
              if (val === null || val === undefined) {
                  setVal(new Date());
              }
          }
      }
  ]);

  const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  class ItsaEmail {
      email() {
          this.predicates.push({ id: 'email', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaEmail, {
      id: 'email',
      validate: (context) => {
          const { val, type, result } = context;
          if (type !== 'string')
              return result.addError(`Expected email but found ${type}`);
          const isValid = rx.test(val);
          if (!isValid) {
              result.addError('Email address is invalid');
          }
      }
  });

  class ItsaEqual {
      equal(val, settings = {}) {
          settings.example = val;
          this.predicates.push({ id: 'equal', settings });
          return this;
      }
  }
  Itsa.extend(ItsaEqual, {
      id: 'equal',
      validate: (context, settings) => {
          const { val, result } = context;
          const { example } = settings;
          const strict = settings.strict ?? true;
          const isEqual = strict ? (val === example) : (val == example);
          if (!isEqual) {
              result.addError(`Did not equal ${example}`);
          }
      }
  });

  class ItsaFalsy {
      falsy() {
          this.predicates.push({ id: 'falsy', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaFalsy, {
      id: 'falsy',
      validate: (context) => {
          const { val, result } = context;
          if (val)
              return result.addError(`Expected falsy value.`);
      }
  });

  class ItsaFunction {
      function(settings = {}) {
          if (settings.length)
              settings.length = primitiveToItsa(settings.length);
          this.predicates.push({ id: 'function', settings });
          return this;
      }
  }
  Itsa.extend(ItsaFunction, {
      id: 'function',
      validate: (context, settings) => {
          const { val, type, result } = context;
          if (type !== 'function')
              return result.addError('Expected function');
          if (settings.length) {
              const subResult = settings.length._validate({
                  key: 'length',
                  parent: null,
                  val: val.length,
                  exists: true,
                  settings: context.validation,
                  path: context.path,
              });
              result.combine(subResult);
          }
      }
  });

  class ItsaInstanceOf {
      instanceof(cls) {
          const settings = { cls };
          this.predicates.push({ id: 'instanceof', settings });
          return this;
      }
  }
  Itsa.extend(ItsaInstanceOf, {
      id: 'instanceof',
      validate: (context, settings) => {
          const { val, result } = context;
          const isInstance = val instanceof settings.cls;
          if (!isInstance) {
              result.addError(`Expected instance of ${settings.cls}`);
          }
      }
  });

  class ItsaInteger {
      integer() {
          this.predicates.push({ id: 'integer', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaInteger, {
      id: 'integer',
      validate: (context) => {
          const { val, result } = context;
          const valid = typeof val === "number"
              && isNaN(val) === false
              && [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].indexOf(val) === -1
              && val % 1 === 0;
          if (!valid) {
              result.addError('Invalid integer');
          }
      }
  });

  class ItsaLength {
      length(min, max) {
          let settings = {
              min, max
          };
          if (typeof min === 'number' && typeof max !== 'number') {
              settings = { exactly: min };
          }
          if (typeof min !== 'number') {
              settings = { min: 1 };
          }
          this.predicates.push({ id: 'length', settings });
          return this;
      }
  }
  Itsa.extend(ItsaLength, {
      id: 'length',
      validate: (context, settings) => {
          const { val, result } = context;
          const len = val ? val.length : null;
          if (typeof len !== 'number') {
              return result.addError('Invalid length');
          }
          if (typeof settings.exactly === 'number' && settings.exactly !== len) {
              return result.addError(`Expected length to be ${settings.exactly}`);
          }
          if (typeof settings.min === 'number' && settings.min > len) {
              return result.addError(`Expected length to be at least ${settings.min}`);
          }
          if (typeof settings.max === 'number' && settings.max < len) {
              return result.addError(`Expected length to be at most ${settings.max}`);
          }
      }
  });

  class ItsaMatches {
      matches(regex) {
          const settings = { regex };
          this.predicates.push({ id: 'matches', settings });
          return this;
      }
  }
  Itsa.extend(ItsaMatches, {
      id: 'matches',
      validate: (context, settings) => {
          const { val, result } = context;
          const valid = settings.regex.test(String(val));
          if (!valid) {
              result.addError(`Does not match ${settings.regex}`);
          }
      }
  });

  class ItsaMax {
      max(max, inclusive) {
          inclusive = inclusive ?? true;
          const settings = { max, inclusive };
          this.predicates.push({ id: 'max', settings });
          return this;
      }
      under(max, inclusive) {
          inclusive = inclusive ?? false;
          const settings = { max, inclusive };
          this.predicates.push({ id: 'max', settings });
          return this;
      }
      below(max, inclusive) {
          inclusive = inclusive ?? false;
          const settings = { max, inclusive };
          this.predicates.push({ id: 'max', settings });
          return this;
      }
      atMost(max, inclusive) {
          inclusive = inclusive ?? true;
          const settings = { max, inclusive };
          this.predicates.push({ id: 'max', settings });
          return this;
      }
  }
  Itsa.extend(ItsaMax, {
      id: 'max',
      validate: (context, settings) => {
          const { val, result } = context;
          const { max, inclusive } = settings;
          if (inclusive) {
              const ok = val <= max;
              if (!ok)
                  result.addError(`Value must be at most ${max}`);
          }
          else {
              const ok = val < max;
              if (!ok)
                  result.addError(`Value must be less than ${max}`);
          }
      }
  });

  class ItsaMin {
      min(min, inclusive) {
          inclusive = inclusive ?? true;
          const settings = { min, inclusive };
          this.predicates.push({ id: 'min', settings });
          return this;
      }
      over(min, inclusive) {
          inclusive = inclusive ?? false;
          const settings = { min, inclusive };
          this.predicates.push({ id: 'min', settings });
          return this;
      }
      above(min, inclusive) {
          inclusive = inclusive ?? false;
          const settings = { min, inclusive };
          this.predicates.push({ id: 'min', settings });
          return this;
      }
      atLeast(min, inclusive) {
          inclusive = inclusive ?? true;
          const settings = { min, inclusive };
          this.predicates.push({ id: 'min', settings });
          return this;
      }
  }
  Itsa.extend(ItsaMin, {
      id: 'min',
      validate: (context, settings) => {
          const { val, result } = context;
          const { min, inclusive } = settings;
          if (inclusive) {
              const ok = val >= min;
              if (!ok)
                  result.addError(`Value must be at least ${min}`);
          }
          else {
              const ok = val > min;
              if (!ok)
                  result.addError(`Value must be greater than ${min}`);
          }
      }
  });

  class ItsaNotEmpty {
      notEmpty() {
          this.predicates.push({ id: 'notEmpty', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaNotEmpty, {
      id: 'notEmpty',
      validate: (context) => {
          const { val, result } = context;
          const len = val ? val.length : null;
          if (typeof len === 'number' && len) {
              return;
          }
          if (Object.prototype.toString.call(val) === "[object Object]") {
              let hasFields = false;
              for (const key in val) {
                  if (!val.hasOwnProperty(key)) {
                      continue;
                  }
                  hasFields = true;
                  break;
              }
              if (!hasFields) {
                  result.addError(`Object cannot be empty`);
              }
              return;
          }
          result.addError(`Value cannot be empty`);
      }
  });

  class ItsaNull {
      null() {
          const settings = { example: null, strict: true };
          this.predicates.push({ id: 'equal', settings });
          return this;
      }
      undefined() {
          const settings = { example: undefined, strict: true };
          this.predicates.push({ id: 'equal', settings });
          return this;
      }
  }
  Itsa.extend(ItsaNull);

  class ItsaNumber {
      number() {
          this.predicates.push({ id: 'number' });
          return this;
      }
  }
  Itsa.extend(ItsaNumber, {
      id: 'number',
      validate: (context) => {
          const { val, type, result } = context;
          if (type !== 'number')
              return result.addError(`Expected number but type is ${type}.`);
          if (isNaN(val))
              return result.addError(`Expected number but found NaN.`);
          if (!isFinite(val))
              return result.addError(`Expected number but found infinity.`);
      }
  });

  class ItsaObject {
      object(example, config = {}) {
          let convertedExample = null;
          if (example) {
              convertedExample = {};
              for (const key in example) {
                  convertedExample[key] = primitiveToItsa(example[key]);
              }
          }
          if (config.key) {
              config.key = primitiveToItsa(config.key);
          }
          if (config.value) {
              config.value = primitiveToItsa(config.value);
          }
          const settings = { example: convertedExample, config };
          this.predicates.push({ id: 'object', settings });
          return this;
      }
  }
  Itsa.extend(ItsaObject, {
      id: 'object',
      validate: (context, settings) => {
          const { val, parent, validation, result, type } = context;
          const { example, config } = settings;
          const extras = config.extras ?? false;
          // Validate object
          if (!val)
              return result.addError(`Expected object but value is ${val}.`);
          if (type !== "object")
              return result.addError(`Expected object but type is ${type}.`);
          if (val instanceof RegExp)
              return result.addError(`Expected object but type is regex.`);
          if (val instanceof Date)
              return result.addError(`Expected object but type is date.`);
          if (Array.isArray(val))
              return result.addError(`Expected object but type is array.`);
          const objectKeys = Object.keys(val);
          if (example) {
              // Validate according to example
              const exampleKeys = Object.keys(example);
              for (const key of exampleKeys) {
                  // For root object, we might skip missing fields
                  if (!parent && validation.partial && !objectKeys.includes(key)) {
                      continue;
                  }
                  const subSchema = example[key];
                  const subResult = subSchema._validate({
                      key,
                      parent: val,
                      val: val[key],
                      exists: key in val,
                      settings: validation,
                      path: [...context.path, key],
                  });
                  result.combine(subResult);
              }
              // Error for extra properties?
              if (!extras) {
                  const extraKeys = objectKeys.filter(k => !exampleKeys.includes(k));
                  if (extraKeys.length) {
                      result.addError(`Extra unknown properties: ${extraKeys.join(', ')}`);
                  }
              }
          }
          if (config.key) {
              for (const key of objectKeys) {
                  const subResult = config.key._validate({
                      key,
                      parent: val,
                      val: key,
                      exists: true,
                      settings: validation,
                      path: [...context.path, key],
                  });
                  result.combine(subResult);
              }
          }
          if (config.value) {
              for (const key of objectKeys) {
                  const subVal = val[key];
                  const subResult = config.value._validate({
                      key,
                      parent: val,
                      val: subVal,
                      exists: true,
                      settings: validation,
                      path: [...context.path, key],
                  });
                  result.combine(subResult);
              }
          }
      }
  });

  const rxObjectId = /^[0-9a-f]{24}$/i;
  class ItsaObjectId {
      objectid() {
          this.predicates.push({ id: 'objectid', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaObjectId, {
      id: 'objectid',
      validate: (context, settings) => {
          const { val, result, type } = context;
          if (!val)
              return result.addError('ObjectId is required');
          if (type !== 'string')
              return result.addError('ObjectId must be a string');
          if (val.length !== 24)
              return result.addError('ObjectId must have 24 characters');
          if (!rxObjectId.test(val))
              return result.addError('ObjectId may only contain 0-9, a-z');
      }
  });

  const convert = (el) => {
      const proto = Object.prototype.toString.call(el);
      const isObject = `[object Object]` === proto;
      const isArray = `[object Array]` === proto;
      if (!isObject && !isArray) {
          return el;
      }
      // replace sub-schemas: depth first
      for (const key in el) {
          el[key] = convert(el[key]);
      }
      if (isObject && el.predicates) {
          const i = new Itsa();
          i.predicates = el.predicates;
          return i;
      }
      return el;
  };
  class ItsaSerialize {
      load(raw) {
          this.predicates = convert(raw).predicates;
          return this;
      }
  }
  Itsa.extend(ItsaSerialize);

  class ItsaString {
      string() {
          this.predicates.push({ id: 'string', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaString, {
      id: 'string',
      validate: (context) => {
          const { type, result } = context;
          if (type !== 'string')
              return result.addError(`Expected string`);
      }
  });

  class ItsaTo {
      toDate() {
          this.predicates.push({ id: 'toDate', settings: null });
          return this;
      }
      toFloat() {
          this.predicates.push({ id: 'toFloat', settings: null });
          return this;
      }
      toInt(radix) {
          const settings = { radix };
          this.predicates.push({ id: 'toInt', settings });
          return this;
      }
      toLowerCase() {
          this.predicates.push({ id: 'toLowerCase' });
          return this;
      }
      toUpperCase() {
          this.predicates.push({ id: 'toUpperCase' });
          return this;
      }
      toNow() {
          this.predicates.push({ id: 'toNow' });
          return this;
      }
      toString() {
          this.predicates.push({ id: 'toString' });
          return this;
      }
      toTrimmed() {
          this.predicates.push({ id: 'toTrimmed' });
          return this;
      }
  }
  Itsa.extend(ItsaTo, {
      id: 'toDate',
      validate: (context) => {
          const { val, setVal, result } = context;
          const date = new Date(val);
          if (!isFinite(date.getTime()))
              return result.addError(`Date conversion failed`);
          setVal(date);
      }
  }, {
      id: 'toFloat',
      validate: (context) => {
          const { val, setVal, result } = context;
          const newFloat = parseFloat(val);
          if (isNaN(newFloat))
              return result.addError(`Float conversion failed`);
          setVal(newFloat);
      }
  }, {
      id: 'toInt',
      validate: (context, settings) => {
          const { val, setVal, result } = context;
          const { radix } = settings;
          const newInt = parseInt(val, radix ?? 10);
          if (isNaN(newInt))
              return result.addError(`Int conversion failed`);
          setVal(newInt);
      }
  }, {
      id: 'toLowerCase',
      validate: (context) => {
          const { val, setVal } = context;
          setVal(String(val).toLowerCase());
      }
  }, {
      id: 'toUpperCase',
      validate: (context) => {
          const { val, setVal } = context;
          setVal(String(val).toUpperCase());
      }
  }, {
      id: 'toNow',
      validate: (context) => {
          const { setVal } = context;
          setVal(new Date());
      }
  }, {
      id: 'toString',
      validate: (context) => {
          const { val, setVal } = context;
          setVal(String(val));
      }
  }, {
      id: 'toTrimmed',
      validate: (context) => {
          const { val, setVal } = context;
          setVal(String(val).trim());
      }
  });

  class ItsaTruthy {
      truthy() {
          this.predicates.push({ id: 'truthy', settings: null });
          return this;
      }
  }
  Itsa.extend(ItsaTruthy, {
      id: 'truthy',
      validate: (context) => {
          const { val, result } = context;
          if (!val)
              return result.addError(`Expected truthy value.`);
      }
  });

  class ItsaTypeOf {
      typeof(type) {
          const settings = { type };
          this.predicates.push({ id: 'typeof', settings });
          return this;
      }
  }
  Itsa.extend(ItsaTypeOf, {
      id: 'typeof',
      validate: (context, settings) => {
          const { val, result } = context;
          const { type } = settings;
          const actualType = typeof val;
          if (type !== actualType) {
              result.addError(`Expected ${type}`);
          }
      }
  });

  class ItsaUnique {
      unique(getter) {
          const settings = { getter };
          this.predicates.push({ id: 'unique', settings });
          return this;
      }
  }
  Itsa.extend(ItsaUnique, {
      id: 'unique',
      validate: (context, settings) => {
          const { val, result } = context;
          const { getter } = settings;
          const set = new Set();
          for (const key in val) {
              let subVal = val[key];
              if (getter)
                  subVal = getter(subVal);
              if (set.has(subVal)) {
                  return result.addError(`${subVal} occurred multiple times`);
              }
              set.add(subVal);
          }
      }
  });

  class ItsaValidation {
      _validate(settings) {
          const { key } = settings;
          const result = new ItsaValidationResult(settings.settings.exhaustive, key, settings.path);
          result.value = settings.val;
          try {
              const setVal = (newVal) => {
                  if (settings.parent) {
                      settings.parent[settings.key] = newVal;
                      settings.val = newVal;
                  }
                  else {
                      result.value = newVal;
                  }
              };
              for (const predicate of this.predicates) {
                  const validator = Itsa.validators[predicate.id];
                  /* istanbul ignore next */
                  if (!validator)
                      throw new Error(`Validator not found: ${predicate.id}`);
                  const context = {
                      setVal,
                      result,
                      val: settings.val,
                      key: settings.key,
                      parent: settings.parent,
                      exists: settings.exists,
                      type: typeof settings.val,
                      validation: settings.settings,
                      path: settings.path,
                  };
                  validator.validate(context, predicate.settings);
                  if (!result.ok)
                      return result;
              }
          }
          catch (e) {
              /* istanbul ignore next */
              if (e !== 'STOP_ON_FIRST_ERROR')
                  throw e;
          }
          return result;
      }
      validate(val, settings = {}) {
          return this._validate({
              val,
              settings,
              key: null,
              parent: null,
              exists: true,
              path: [],
          });
      }
      validOrThrow(val, settings) {
          const result = this.validate(val, settings);
          if (!result.ok) {
              const error = new ItsaValidationException(`${result.errors[0].path.join('.')}: ${result.errors[0].message}`);
              error.result = result;
              throw error;
          }
      }
  }
  Itsa.extend(ItsaValidation);

  class ItsaVerify {
      verify(verifier) {
          const settings = { verifier };
          this.predicates.push({ id: 'verify', settings });
          return this;
      }
  }
  Itsa.extend(ItsaVerify, {
      id: 'verify',
      validate: (context, settings) => {
          const { val, result } = context;
          const { verifier } = settings;
          try {
              const response = verifier(val);
              if (typeof response === 'boolean') {
                  if (response === false) {
                      result.addError(`Value is invalid`);
                  }
                  return;
              }
              if (typeof response === 'string') {
                  return result.addError(response);
              }
          }
          catch (e) {
              if (e === 'STOP_ON_FIRST_ERROR')
                  throw e;
              return result.addError(e);
          }
      }
  });

  class ItsaValidationException extends Error {
  }
  class ItsaValidationResult {
      constructor(exhaustive, key, path) {
          this.exhaustive = exhaustive;
          this.key = key;
          this.path = path;
          this.ok = true;
          this.errors = [];
      }
      addError(message) {
          this.ok = false;
          this.message = message;
          this.errors.push({ message, key: this.key, path: this.path }); // path: null, val,
          if (!this.exhaustive) {
              throw 'STOP_ON_FIRST_ERROR';
          }
      }
      combine(result) {
          this.ok = this.ok && result.ok;
          for (const e of result.errors) {
              this.errors.push(e);
              if (!this.exhaustive) {
                  throw 'STOP_ON_FIRST_ERROR';
              }
          }
      }
  }
  class Itsa {
      constructor() {
          this.predicates = [];
      }
      static extend(cls, ...validators) {
          for (const validator of validators) {
              Itsa.validators[validator.id] = validator;
          }
          const keys = Object.getOwnPropertyNames(cls.prototype).filter(m => m !== 'constructor');
          for (const key of keys) {
              const val = cls.prototype[key];
              Itsa.prototype[key] = val;
              /* istanbul ignore next */
              if (typeof val === 'function') {
                  itsa[key] = (...args) => {
                      const it = new Itsa();
                      return it[key](...args);
                  };
              }
          }
      }
  }
  Itsa.validators = {};
  const itsa = { predicates: [] };

  exports.Itsa = Itsa;
  exports.ItsaValidationException = ItsaValidationException;
  exports.ItsaValidationResult = ItsaValidationResult;
  exports.itsa = itsa;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=itsa.js.map
