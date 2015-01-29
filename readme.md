[![Build Status](https://travis-ci.org/bendytree/node-itsa.svg?branch=master)](https://travis-ci.org/bendytree/node-itsa)

#itsa

*Pronounced "it's a".*

`itsa` is a JavaScript library designed to validate JavaScript data.

The data can be primitives, objects, arrays, or any mixture therein. It is designed to expressive, composable, extensible, simple, and clean. There are no dependencies,
no global variables, no extending of native objects. `itsa` is the only object exported by this library.


## Table of Contents

 - [Installation](#installation)
 - [How It Works](#how-it-works)
 - [Required vs Optional](#required-vs-optional)
 - [Validate](#validate)
 - [Validators](#validators)
     - [any](#itsaanyvalidator--validator)
     - [array](#itsaarrayexample-allowextraitems)
     - [custom](#itsacustomvalidatorfunction)
     - [default](#itsadefaultdefaultvalue)
     - [equal](#itsaequalexamplevalue)
     - [maxLength](#itsamaxlengthmax)
     - [object](#itsaobjectexample-allowextrafields)
     - [string](#itsastring)
     - [update](#itsaupdatedefaultvalue)
 - [Extending Itsa](#extending-itsa)
 - [Custom Error Messages](#custom-error-messages)
 - [Short Circuiting](#short-circuiting)
 - [Alternative Libraries](#alternative-libraries)
 - [License](#license)
 - [Todo](#todo)



# Installation

`itsa` has no dependencies and works on server or client via npm:

    > npm install itsa --save

``` js
var itsa = require("itsa");
```

Right now, there's no `itsa.js` that you can drop in to your client side, so you should use browserify.
Pull requests that automatically bundle `itsa.js` and `itsa.min.js` are welcome.


------------------------------------------------

# How It Works

Let's say you want to validate an object before you save it to your database.

``` js
var userSchema = itsa.object({
  firstname: itsa.string().maxLength(20),
  lastname: itsa.string().maxLength(20),
  age: itsa.any(itsa.number().between(18, 35), undefined),
  address: itsa.object({
    line1: itsa.string(),
    line2: itsa.string(),
    city: itsa.string(),
    state: itsa.string().maxLength(2),
    zip: itsa.string()
  });
});

var data = {
  firstname: "Bob",
  lastname: "Tables",
  address: {
    line1: "1000 Penny Lane",
    line2: "Suite 201",
    city: "Cityville",
    state: "California",
    zip: "90192"
  }
};

var result = userSchema.validate(data);

result.valid === false;
result.describe() === "address.state: length is 10, max is 2";
```

So you can define entire object graph with strings, numbers, arrays, objects, etc.

Once your data is ready, simple call `validate` on you itsa object to get the result.

The result has a `valid` field that tells you if the validation succeeded. It also includes
an array of logs that include all validation results (successes and failures).  If you'd like
to show a descriptive error message, simply call `result.describe()` which will give you a string
describing the validation results.




------------------------------------------------

# Required vs Optional

If you want to make a property optional, then you should use the `itsa.any` to list all
of the values that are valid.  Here's a simple example that shows the difference:

``` js
//only a string is valid
itsa.string().validate(null).valid === false;

//
itsa.any(itsa.string(), null).validate(null).valid === true;
```






# Validate

#### validate(value) -> result

Once you've built up your fancy validator, just call validate with your value.

It will return a result object that has `valid` set to true or false. You can also
call `result.describe()` to get a string that describes the reason for failure.

``` js
 var validator = itsa.string().maxLength(5);
 var result = validator.validate("Bob was here");
 result.valid === false;
 result.describe() === "Length is 12, max is 5";
```

#### Using a Getter

You can also pass a function to `.validate(...)` instead of your actual value. Why would
you want to do that? I don't know, but it's useful within the api. Your function will be
called (possibly multiple times) and the return value is the data that is validated.


#### Result Logs

If `result.valid` and `result.describe()` aren't enough for you, then you can also
use `result.logs` to get a list of the validation results. Validation results have the
following properties:

 - `path` - A string. Blank for your root object. For validators within an object or an array it will show where the data is located within your root object.
 - `validator` - A string. The name of the validator that was executed.
 - `message` - A string. The success or failure message describing the outcome of this validation.
 - `valid` - A boolean. `true` when the specific validator succeeded. `false` when it failed.






# Validators

### itsa.any(validator [, validator])

Checks each validator in order and stops once it finds a validator that succeeds. If none
of the listed validators succeed, then validation will fail.

You may list one validator per argument or you may pass an array of validators. If you don't
give any validators then an error will be thrown.

###### Arguments

 - `validator` - `itsa` instance, custom validation function, or primitive equality example. At least one is required.

###### Examples

``` js
// must match one of these strings
itsa.any("red", "white", "blue");
```

``` js
// valid for string (length <= 3), undefined, or null
itsa.any(itsa.string().maxLength(3), undefined, null);
```








----------------------------------------------------------------------

### itsa.array([example[, allowExtraItems]])

This validator succeeds when the data is a JavaScript array.

``` js
itsa.array().validate([]).valid === true;
itsa.array().validate({}).valid === false;
```

##### Arguments

 - `example` - Optional. Array. Must be an array of zero or more validators if given.
 - `allowExtraItems` - Optional. Boolean. Default is true if no example is given. Default is false if example is given. See below.

##### Item Validation

You can optionally validate the items within an array by passing an "example" array. Each item in your
data's array will be validated according to its index. For example, the first validator will be run against
the first item in the array, etc.

``` js
itsa.array([itsa.string()]).validate(["red"]).valid === true;
itsa.array([itsa.string()]).validate([]).valid === false;
itsa.array([itsa.string()]).validate([42]).valid === false;
```

##### Allowing Extra Items

If there are more items in your real array compared to your example array, then this is considered invalid.

To allow extra items, pass `true` as the second parameter.

``` js
itsa.array([itsa.string()]).validate(["red", 42]).valid === false;
itsa.array([itsa.string()], true).validate(["red", 42]).valid === true;
```



----------------------------------------------------------------------

### itsa.custom(validatorFunction)

You can use a custom validator if you have special logic that you'd like to test.

Your function will receive the data value. You can return values
in one of three different ways:

##### Returning true or false

If you return `true` then the data is considered valid. `false` means invalid.
If the data is invalid, then a generic error message is used.

``` js
var isMod7 = function(val){ return val % 7 === 0; }
var result = itsa.custom(isMod7).validate(11);
result.valid === false;
result.describe() === "Custom validator failed.";
```

##### Returning null or a string

Instead of returning a boolean, you can return a string that is the validation
error message, or you can return `null` if there is no error.

``` js
var startsWithDb = function(val){
  return val.indexOf("db.") === 0 ? null : "Value does not begin with `db.`";
}
var result = itsa.custom(startsWithDb).validate("cart_item");
result.valid === false;
result.describe() === "Value does not begin with `db.`";
```

Of course, this example is contrived. You'd probably use a built-in validator
to do this check.







----------------------------------------------------------------------

### itsa.default(defaultValue)

In some cases, you may want to actually set, update, default, or otherwise change the data that is being validated.

NOTE: Data changes (like `default` and `update`) can only be used within an object or array - otherwise itsa has no way of actually setting the new value.


##### Default Value Functions

Sometimes you'll want to set a default value. If the original data is falsy, then your new value is used:

``` js
var validator = itsa.object({
  color: itsa.default("red").string().any("red", "white", "blue")
});

var obj = {};
validator.validate(obj).valid === true;
obj.color === "red";
```

Keep in mind, order matters. So if you did `.string().default("red")` then the string validator would fail
before the default had a chance to get set.


##### Default Value Functions

In other cases, you'll want to set a `live` value as a default. For example, if the object doesn't have
a created date then you'd want to set one. In this case, you'd pass a function to `.default(...)` that
would be called and would return the default value.

``` js
var validator = itsa.object({
  created: itsa.default(function(){ return new Date(); }).date()
});

var obj = {};
validator.validate(obj).valid === true;
obj.created; //new Date()
```

To change data regardless of the original value, use `.update()`.





----------------------------------------------------------------------

### itsa.equal(exampleValue)

`itsa.equal(...)` will run a strict equality test (===) between the exampleValue and your data.

##### Arguments

 - `exampleValue` - a primitive value to check against. If the data matches this value then the validation succeeds.

##### Examples

``` js
itsa.equal(42).validate(42).valid === true;
itsa.equal(null).validate(false).valid === false;
```

This is especially helpful when used with the `object` or `any` validators:

``` js
var validator = itsa.any(itsa.equal("red"), itsa.equal("blue"));
validator.validate("red").valid === true;

var validator = itsa.object({
  type: itsa.equal("db.user")
});
validator.validate({type:"db.product"}).valid === false;
```

##### Shorthand

For convenience, the `object`, `array`, and `any` validators can
receive primitive objects and will automatically convert them to
a `.equal(...)` validator. Here is the same example using the primitive
version of equality:

``` js
var validator = itsa.any("red", "blue");
validator.validate("red").valid === true;

var validator = itsa.object({
  type: "db.user"
});
validator.validate({type:"db.product"}).valid === false;
```






----------------------------------------------------------------------

### itsa.maxLength(max)

This validation succeeds if your data has a length property and that length is <= the given max.

If you omit a max value number then an error will be thrown.

##### Arguments

 - `max` - a number to compare the length against

##### Examples

    itsa.maxLength(3).validate("blue").valid === false;
    itsa.maxLength(3).validate([7,42]).valid === true;
    itsa.maxLength(3).validate({length:1}).valid === true;
    itsa.maxLength(3).validate(null).valid === false;




----------------------------------------------------------------------

### itsa.object(example, allowExtraFields)

The object validator succeeds when the data is an actual JavaScript object `{}`.

Technically, dates, arrays, Strings and even null are all JavaScript objects, but those types will not
pass this validation. Only a hash (ie `{}` or `new Object()`) is considered an object here.

##### Arguments

 - `example` - Optional. A hash where the keys are the keys to verify and the values are `itsa` validators, function validators, or primitives for equality checks.
 - `allowExtraFields` - Optional. Defaults to true when no example is given. Defaults to false if example is given. See below.

##### Example

``` js
//simple object tests
itsa.object().validate({}).valid === true;
itsa.object().validate([]).valid === false;
itsa.object().validate(null).valid === false;
itsa.object().validate(new Date()).valid === false;
```

##### Validating Fields

You can optionally pass an object where the values are validators to run against the keys. You can
nest objects and arrays within objects and arrays.

``` js
//validating object keys
var validator = itsa.object({
  name: itsa.string().maxLength(20),
  age: itsa.any(itsa.number, undefined)
});
validator.validate({
  name: "Bob"
}).valid === true;
```

##### Allowing Extra Fields

If you validate fields (by passing an example object), then any extra fields will be considered invalid.
In other words, if you only validate a `name` field but the data also contains an `email` field then
validation will fail.

If you want to allow any extra fields that you didn't define in your example, then pass `true` as the
second parameter to `itsa.object(..., true)` which means `allowExtraFields`.

``` js
itsa.object({name:itsa.string()}).validate({name:"Bob", color:"red"}).valid === false;
itsa.object({name:itsa.string()}, true).validate({name:"Bob", color:"red"}).valid === true;
```


----------------------------------------------------------------------

### itsa.string()

The string validator makes sure your data is a string. If you want to allow for null
or undefined then you should use `itsa.any(itsa.string(), null, undefined)`.

##### Examples

``` js
//simple object tests
itsa.string().validate("").valid === true;
itsa.string().validate("abc").valid === true;
itsa.string().validate(null).valid === false;
```




----------------------------------------------------------------------

### itsa.update(defaultValue)

Use `.update(...)` to give yourself the opportunity to change a value, even if the original
value was not falsy.

##### Setting A Brand New Value

You might use this if you have an `updated` field that always gets updated:

``` js
var validator = itsa.object({
  updated: itsa.update(function(val){ return new Date(); })
});

//updated on 1970
var obj = { updated: new Date(0) };

validator.validate(obj);
obj.updated; //now
```

##### Changing The Original Data

Instead of blindly overriding a value, you may want to change the data based on its current value.
For example, maybe you want a chance to do some type conversion before you run your validators. Your
updater function will receive the current value as the first parameter.

``` js
var validator = itsa.object({
  age: itsa.update(function(val){ return parseInt(val); }).number()
});

var obj = { age: "18" };
validator.validate(obj).valid === true;
obj.age === 18;
```












# Extending Itsa

Using `.custom(...)` validators are great for special, one-off validations. If you find yourself using
a custom validator quite a bit then you may want to extend the itsa object with your custom validator.

This means you'll be able to call your validator like a first-class validator (ie. `itsa.number().myValidator()...`).

To extend `itsa`, call `extend` with a hash of your new validators:

``` js
//extending itsa
itsa.extend({
  mod: function builder(operand) {
    return function checker(val) {
      return val % operand === 0;
    };
  }
});

//using the new extension
itsa.number().mod(3).validate(7).valid === false;
```

Extend uses the key in your hash as the name of the extension and the value as a validation builder function.

Your validation builder should return another function that is the same thing as a custom validator. In other words
it should be a function that receives the value (val) and returns a value indicating whether the value is valid. Like
the custom validator, your return value can be a boolean, string, or results object. See the custom validator section
for more information.

NOTE: both the builder function and the checker are called with your `itsa` instance as the context. This gives you
access to the itsa context (which is useful in advanced situations). If you need your context to be something else, then
bind it yourself.


# Custom Error Messages

Each validator will automatically generate an appropriate error message, but you may like to customize
those messages. You can customize the error message of any validator using `.msg(...)`:

``` js
itsa.string().validate(42).describe() === "Expected a string, but found a number";

itsa.string().msg("boomsies").validate(42).describe() === "boomsies";
```




# Short Circuiting

If you have multiple validations for a single field, then validation will stop when it
runs into the first invalid result. For example:

``` js
var result = itsa.string().maxLength(5).validate(3);
result.valid === false;
result.logs.length === 1;
result.logs[0].valid === false;
result.logs[0].validator === "string";
```





# Alternative Libraries

JavaScript Data Validators:

 - [molnarg/js-schema](https://github.com/molnarg/js-schema/) - "Simple and intuitive schema validator"
 - [ansman/validate.js](https://github.com/ansman/validate.js) - "Declarative validation written in javascript"
 - [eivindfjeldstad/validate](https://github.com/eivindfjeldstad/validate) - "Validate nested object properties in javascript"
 - [chriso/validator.js](https://github.com/chriso/validator.js) - "String validation and sanitization"
 - [ron-liu/validate-obj.js](https://github.com/ron-liu/validate-obj.js) - "simple way to validate object in javasciprt"

HTML Form Validators

 - [thedersen/backbone.validation](https://github.com/thedersen/backbone.validation) - "A validation plugin for Backbone.js that validates both your model as well as form input"
 - [rickharrison/validate.js](https://github.com/rickharrison/validate.js) - "Lightweight JavaScript form validation library inspired by CodeIgniter."
 - [DiegoLopesLima/Validate/validate.js](https://github.com/DiegoLopesLima/Validate) - "The jQuery Validate is an advanced plugin for an easily and quickly form validation"
 - [guillaumepotier/Parsley.js](https://github.com/guillaumepotier/Parsley.js) - "Validate your forms, frontend, without writing a single line of javascript - http://parsleyjs.org"
 - [formvalidation/formvalidation](https://github.com/formvalidation/formvalidation) - "The best @jquery plugin to validate form fields."


# License

[MIT](https://github.com/bendytree/node-itsa/blob/master/LICENSE)


## Todo

 - arrays
 - noOtherFields
 - unique
 - types (dates, numbers, boolean, etc)


