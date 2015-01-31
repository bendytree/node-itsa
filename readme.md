[![Build Status](https://travis-ci.org/bendytree/node-itsa.svg?branch=master)](https://travis-ci.org/bendytree/node-itsa)

#itsa

 > Pronounced "it's a".

`itsa` is a JavaScript library designed to validate JavaScript data. It is composable and extensible. There are no dependencies, no global variables, and no extending of native objects.

###### Simple Example

```js
var itsa = require("itsa");

itsa.object().validate([]).valid === false;
```

###### Complex Example

```js
var itsa = require("itsa");

var userDefinition = itsa.object({
  name: String,
  age: itsa.any(
    itsa.undefined(),
    itsa.number().between(18, 200)
  ),
  email: itsa.email(),
  colors: itsa.arrayOf(
    itsa.any("red", "green", "blue", "yellow", "white", "black")
  ).notEmpty()
});

var result = userDefinition.validate({ name: "Bob", email: "bob@example.com" });
result.valid === false;
result.describe() === "colors: Cannot be empty.";
```


## Table of Contents 

 - [Installation](#installation)
 - [How It Works](#how-it-works)
 - [Required vs Optional](#required-vs-optional)
 - [Validate](#validate)
 - [Validators](#validators)
     - [after](#itsaaftervalue--inclusive)
     - [alphanumeric](#itsaalphanumeric)
     - [any](#itsaanyvalidator--validator)
     - [args](#itsaargsexample-allowextraitems)
     - [array](#itsaarrayexample-allowextraitems)
     - [arrayOf](#itsaarrayofexample)
     - [before](#itsabeforevalue--inclusive)
     - [between](#itsabetweenmin-max-inclusive)
     - [boolean](#itsaboolean)
     - [contains](#itsacontainsvalue)
     - [custom](#itsacustomvalidatorfunction)
     - [date](#itsadate)
     - [email](#itsaemail)
     - [empty](#itsaempty)
     - [endsWith](#itsaendswithvalue)
     - [equal](#itsaequalexamplevalue)
     - [false](#itsafalse)
     - [falsy](#itsafalsy)
     - [function](#itsafunction)
     - [hex](#itsahex)
     - [instanceof](#itsainstanceofcls)
     - [integer](#itsainteger)
     - [json](#itsajson)
     - [len](#itsalenexactormin-max)
     - [lowercase](#itsalowercase)
     - [matches](#itsamatchesregexp)
     - [maxLength](#itsamaxlengthmax)
     - [minLength](#itsaminlengthmin)
     - [nan](#itsanan)
     - [notEmpty](#itsanotempty)
     - [null](#itsanull)
     - [number](#itsanumber)
     - [object](#itsaobjectexample-allowextrafields)
     - [over](#itsaovervalue--inclusive)
     - [regexp](#itsaregexp)
     - [startsWith](#itsastartswithvalue)
     - [string](#itsastring)
     - [true](#itsatrue)
     - [truthy](#itsatruthy)
     - [typeof](#itsatypeoftype)
     - [Type Classes](#Type Classes)
     - [undefined](#itsaundefined)
     - [under](#itsaundervalue--inclusive)
     - [unique](#itsauniquegetter)
     - [uppercase](#itsauppercase)
 - [Updaters](#updaters)
     - [to](#itsatovalueorgetter)
     - [toDate](#itsatodate)
     - [toFloat](#itsatofloat)
     - [toInteger](#itsatointegerradix)
     - [toLowercase](#itsatolowercase)
     - [toNow](#itsatonow)
     - [toString](#itsatostring)
     - [toTrimmed](#itsatotrimmed)
     - [toUppercase](#itsatouppercase)
     - [default](#itsadefaultdefaultvalue)
     - [defaultNow](#itsadefaultnow)
 - [Extending Itsa](#extending-itsa)
 - [Aliasing Validators](#aliasing-validators)
 - [Custom Error Messages](#custom-error-messages)
 - [Short Circuiting](#short-circuiting)
 - [Pull Requests](#pull-requests)
 - [Alternative Libraries](#alternative-libraries)
 - [Testing](#testing)
 - [License](#license)



# Installation

`itsa` has no dependencies and works on via npm:

    > npm install itsa --save

``` js
var itsa = require("itsa");
```

#### Without NPM or Browserify

If you need it client side and don't use browserify, then use `dist/itsa.js` for development (it has source maps) and
use `dist/itsa.min.js` for production.

    > itsa.min.js - 28K minified, 5K gzipped


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


#### Result Logs

If `result.valid` and `result.describe()` aren't enough for you, then you can also
use `result.logs` to get a list of the validation results. Validation results have the
following properties:

 - `path` - A string. Blank for your root object. For validators within an object or an array it will show where the data is located within your root object.
 - `validator` - A string. The name of the validator that was executed.
 - `message` - A string. The success or failure message describing the outcome of this validation.
 - `valid` - A boolean. `true` when the specific validator succeeded. `false` when it failed.






# Validators



### itsa.after(value[, inclusive])

An alias for [itsa.over(...)](#itsaovervalue--inclusive).







----------------------------------------------------------------------

### itsa.alphanumeric()

Valid for a string or number that only contains 0-9, a-z, A-Z characters.

If you care about case, use the `.lowercase()` or `.uppercase()` validator as well.

##### Example

``` js
itsa.alphanumeric().validate("ABCabcXYZxyz123").valid === true;
itsa.alphanumeric().validate(34).valid === true;
itsa.alphanumeric().validate("abc-def").valid === false;
```





----------------------------------------------------------------------

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

### itsa.args([example[, allowExtraItems]])

This validates that the given data is an `arguments` object. You may
optionally validate the argument items according to their index.

NOTE: Ideally this would be called `itsa.arguments` but that's not possible.

``` js
(function(){
  itsa.args().validate(arguments).valid === true;
})();
itsa.args().validate([]).valid === false;
itsa.args().validate({}).valid === false;
```

##### Arguments

 - `example` - Optional. Array. Must be an array of zero or more validators if given.
 - `allowExtraItems` - Optional. Boolean. Defaults to `true` if no example is given. Defaults to `false` if example is given. See below.

##### Item Validation

You can optionally validate the items within an arguments object by passing an "example" array. Each item in your
data's array will be validated according to its index. For example, the first validator will be run against
the first argument, etc.

``` js
(function(){
  itsa.args([itsa.string()]).validate(arguments).valid === true;
})("red");

(function(){
  itsa.args([itsa.string(), itsa.number()]).validate(arguments).valid === true;
})("red", 42);
```

##### Allowing Extra Items

If there are more items in your real arguments compared to your example array, then this is considered invalid.

To allow extra items, pass `true` as the second parameter.

``` js
(function(){
  itsa.args([
    itsa.string()
  ]).validate(arguments).valid === false;
})("red", 42);

(function(){
  itsa.args([
    itsa.string()
  ], true).validate(arguments).valid === true;
})("red", 42);

```








----------------------------------------------------------------------

### itsa.array([example[, allowExtraItems]])

Like the `.arrayOf` validator, this succeeds when the data is a JavaScript array. You may
optionally validate the arrays items according to their index.


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

NOTE: If each array item should have the same validation then use the `itsa.arrayOf` validator (below).

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

### itsa.arrayOf(example)

Like the `.array` validator, this succeeds when the data is a JavaScript array. You can additionally
validate each item by passing in a validator.


``` js
itsa.array().validate([]).valid === true;
itsa.array().validate({}).valid === false;
```

##### Arguments

 - `example` - Optional. An itsa validator, function, or primitive equality check that will be run against each item in the array.

##### Item Validation

To validate the items of the array, pass in a validator.

NOTE: If array items are different and should be validated by their index, then use the `itsa.array` validator (above).

``` js
itsa.arrayOf(itsa.string()).validate(["red", "blue"]).valid === true;
itsa.arrayOf(itsa.string()).validate([]).valid === true;
itsa.arrayOf(itsa.string()).validate(["red", 42]).valid === false;
```

If you care about the number of items in an array, use the `itsa.maxLength(...)` validator, etc.








----------------------------------------------------------------------

### itsa.before(value[, inclusive])

An alias for [itsa.under(...)](#itsaundervalue--inclusive).








----------------------------------------------------------------------

### itsa.between(min, max[, inclusive])

Validate whether your data is between the `min` and `max` value using the `<` and `>` operators.

By default, the check is "exclusive" meaning the actual min and max values are not considered valid. You
can change this by passing `true` for the third argument.

##### Arguments

 - `min` - Required. The minimum allowed value (minimum excluded).
 - `max` - Required. The maximum allowed value (maximum excluded).
 ` `inclusive` - Optional. Boolean. Default is `false`. Pass `true` to do an inclusive check.

##### Exclusive Example

``` js
itsa.between(3, 5).validate(4).value === true;
itsa.between(3, 5).validate(3).value === false;
itsa.between(3, 5).validate(5).value === false;
itsa.between("a", "c").validate("b").value === true;
itsa.between("a", "c").validate("c").value === false;
itsa.between(new Date(1300000000000), new Date(1500000000000)).validate(new Date(1400000000000)).value === true;
itsa.between(new Date(1300000000000), new Date(1500000000000)).validate(new Date(1300000000000)).value === false;
```

##### Inclusive Example

``` js
itsa.between(3, 5, true).validate(3).value === true;
itsa.between(3, 5, true).validate(5).value === true;
itsa.between("a", "c", true).validate("c").value === true;
itsa.between(new Date(1300000000000), new Date(1500000000000), true).validate(new Date(1300000000000)).value === true;
```








----------------------------------------------------------------------

### itsa.boolean()

This succeeds when the data is a JavaScript boolean - `true` or `false`.

``` js
itsa.boolean().validate(true).valid === true;
itsa.boolean().validate(false).valid === true;
itsa.boolean().validate(1).valid === false;
itsa.boolean().validate(0).valid === false;
```

For a weaker test, consider `itsa.falsy()` or `itsa.truthy()`.









----------------------------------------------------------------------

### itsa.contains(value)

Performs an `indexOf` check on strings and arrays to see if the given value is found.

##### Arguments

 - `value` - Required. The value (string or array item) that should be found within your data

##### Examples

``` js
itsa.contains("red").validate("redbird").valid === true;
itsa.contains(42).validate([42, 43]).valid === true;
itsa.contains("blue").validate("redbird").valid === false;
itsa.contains(99).validate([42, 43]).valid === false;
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

### itsa.date()

Valid when data is a JavaScript date and is not an "Invalid Date" Date object.

``` js
itsa.date().validate(new Date()).valid === true;
itsa.date().validate(new Date(1524644932046)).valid === true;
itsa.date().validate(new Date("red")).valid === false;
itsa.date().validate(1524644932046).valid === false;
itsa.date().validate(null).valid === false;
```







----------------------------------------------------------------------

### itsa.email()

Valid for a string that is a valid email address.

NOTE: There are many ways to validate an email address. If you have your own validation in mind, use the `itsa.matches(...)` validator.

##### Example

``` js
itsa.email().validate("bob@example.com").valid === true;
itsa.email().validate(" bob@example.com").valid === false;
itsa.email().validate("bob@example.com ").valid === false;
itsa.email().validate("Bob <bob@example.com>").valid === false;
```








----------------------------------------------------------------------

### itsa.empty()

Valid for empty arrays, objects with no keys, or strings with length 0. Any other value is invalid.

##### Examples

``` js
itsa.empty().validate([]).valid === true;
itsa.empty().validate({}).valid === true;
itsa.empty().validate("").valid === true;
itsa.empty().validate(null).valid === false;
itsa.empty().validate(undefined).valid === false;
itsa.empty().validate([42]).valid === false;
itsa.empty().validate({name:"Bob"}).valid === false;
itsa.empty().validate("Bob").valid === false;
```









----------------------------------------------------------------------

### itsa.endsWith(value)

Performs an `indexOf` check on strings and arrays to see if the given value is found at the very end.

##### Arguments

 - `value` - Required. The value (string or array item) that should be found at the end of your data.

##### Examples

``` js
itsa.endsWith("red").validate("bigred").valid === true;
itsa.endsWith(42).validate([5, 42]).valid === true;
itsa.endsWith("red").validate("redbird").valid === false;
itsa.endsWith(5).validate([5, 42]).valid === false;
```







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

### itsa.hex()

Valid for a string or number that only contains 0-9, a-f, A-F characters.

If you care about case, use the `.lowercase()` or `.uppercase()` validator as well.

##### Example

``` js
itsa.hex().validate("faC8").valid === true;
itsa.hex().validate(34).valid === true;
itsa.hex().validate("aabbxyz").valid === false;
```







----------------------------------------------------------------------

### itsa.instanceof(cls)

Valid when the data matches `data instanceof cls`.

This does an actual `instanceof` check, so it may have unexpected results.
For example, `43 instanceof Number === false`. It may have unexpected results across frames in a web browser, since it uses `instanceof`.

In most cases, you may be better off using validators like `itsa.number()`.

##### Arguments

 - `cls` - Required. A class to compare against such as `String` or `Number`.

##### Example

``` js
itsa.instanceof(Object).validate({}).valid === true;
itsa.instanceof(String).validate("red").valid === false; // !!!
itsa.instanceof(Number).validate(42).valid === false; // !!!
```

##### Custom Class

``` js
var User = function () { };
var user = new User();

itsa.instanceof(User).validate(user).valid === true;
```







----------------------------------------------------------------------

### itsa.integer()

Valid for numbers with no decimal.

Also invalid for `NaN`, `Number.NEGATIVE_INFINITY`, and `Number.POSITIVE_INFINITY`.

##### Examples

``` js
itsa.integer().validate(3).valid === true;
itsa.integer().validate(-344).valid === true;
itsa.integer().validate(0).valid === true;
itsa.integer().validate(3.0).valid === true;
itsa.integer().validate(3.5).valid === false;
itsa.integer().validate(null).valid === false;
itsa.integer().validate("3").valid === false;
itsa.integer().validate([]).valid === false;
itsa.integer().validate(NaN).valid === false;
itsa.integer().validate(Number.NEGATIVE_INFINITY).valid === false;
itsa.integer().validate(Number.POSITIVE_INFINITY).valid === false;
```








----------------------------------------------------------------------

### itsa.false()

Valid strictly when the value is the JavaScript boolean `false`. To validate falsy values, use the `.falsy()` validator.

##### Examples

``` js
itsa.false().validate(false).valid === true;
itsa.false().validate(0).valid === false;
itsa.false().validate(undefined).valid === false;
```








----------------------------------------------------------------------

### itsa.falsy()

Valid for values who are "falsy". In other words, values who evaluate to false when converted to
a boolean via JavaScript's implicit type casting.  Other validators of interest include `itsa.false()`,
`itsa.undefined()`, `itsa.null()`, `itsa.any(false, undefined, null)`, etc.

##### Examples

``` js
itsa.falsy().validate(false).valid === true;
itsa.falsy().validate(0).valid === true;
itsa.falsy().validate(undefined).valid === true;
itsa.falsy().validate(null).valid === true;
itsa.falsy().validate(true).valid === false;
itsa.falsy().validate(1).valid === false;
itsa.falsy().validate([]).valid === false;
```








----------------------------------------------------------------------

### itsa.function()

Valid for values which are functions.

##### Examples

``` js
itsa.falsy().validate(function(){}).valid === true;
itsa.falsy().validate(0).valid === false;
itsa.falsy().validate(undefined).valid === false;
itsa.falsy().validate(null).valid === false;
itsa.falsy().validate(true).valid === false;
itsa.falsy().validate(1).valid === false;
itsa.falsy().validate([]).valid === false;
```








----------------------------------------------------------------------

### itsa.json()

Valid for strings that can be parsed as JSON using `JSON.parse()`.

##### Examples

``` js
itsa.json().validate("{}").valid === true;
itsa.json().validate("[42]").valid === true;
itsa.json().validate("[sdf").valid === false;
```








----------------------------------------------------------------------

### itsa.matches(regexp)

Succeeds if the regexp matches the given value using `rx.test`. Non string values
can be compared against according to JavaScripts implicit type conversion.


##### Arguments

 - `regexp` - Required. A JavaScript regular expression.

##### Examples

``` js
itsa.matches(/.at/).validate("hat").valid === true;
itsa.matches(/.at/).validate("HAT").valid === false;
itsa.matches(/.at/i).validate("HAT").valid === true;
itsa.matches(/.at/).validate("hut").valid === false;
itsa.matches(/99/).validate(99).valid === true;
```






----------------------------------------------------------------------

### itsa.len(exactOrMin, max)

NOTE: I wish this was called `.length(...)` but `length` cannot be set on a constructor.

This validator requires your data to meet one of the following conditions:

 - if no arguments are given, then `.length != 0`
 - if `exactOrMin` is given but not `max`, then length must match exactly: `.length === exactOrMin`
 - if both `exactOrMin` and `max` are given, then `.length >= exactOrMin && .length <= max` (so both numbers are inclusive)

You may otherwise find `.minLength(...)` or `.maxLength(...)` useful.

##### Arguments

 - `exactOrMin` - Optional. number. (see above)
 - `max` - Optional. number. (see above)

##### No Length Given

If no length is given, then the validator is successful if the length is a truthy value.

``` js
itsa.len().validate([]).valid === false;
itsa.len().validate([42]).valid === true;
itsa.len().validate({}).valid === false;
itsa.len().validate({a:1}).valid === false;
itsa.len().validate({length:1}).valid === true;
itsa.len().validate("").valid === false;
itsa.len().validate("red").valid === true;
itsa.len().validate(null).valid === false;
```

##### `exactOrMin` Given

If only `exactOrMin` is given, then the validator checks if the length field
matches `exactOrMin`.

``` js
//strings
itsa.len(3).validate("red").valid === true;
itsa.len(3).validate("blue").valid === false;
itsa.len(3).validate("").valid === false;

//arrays
itsa.len(2).validate([]).valid === false;
itsa.len(2).validate([5]).valid === false;
itsa.len(2).validate([5,6]).valid === true;
itsa.len(2).validate([5,6,7]).valid === false;

//objects
itsa.len(1).validate({a:3}).valid === false;
itsa.len(1).validate({length:1}).valid === true;

//other
itsa.len(4).validate(null).valid === false;
```


##### `exactOrMin` and `max` Given

If only `exactOrMin` and `max` are given, then the validator checks if the length field
is between the two values (inclusively).

``` js
//strings
itsa.len(3,5).validate("").valid === false;
itsa.len(3,5).validate("red").valid === true;
itsa.len(3,5).validate("blue").valid === true;
itsa.len(3,5).validate("green").valid === true;
itsa.len(3,5).validate("yellow").valid === false;

//arrays
itsa.len(2,3).validate([]).valid === false;
itsa.len(2,3).validate([5]).valid === false;
itsa.len(2,3).validate([5,6]).valid === true;
itsa.len(2,3).validate([5,6,7]).valid === true;
itsa.len(2,3).validate([5,6,7,9]).valid === false;

//objects
itsa.len(3,4).validate({length:4}).valid === true;

//other
itsa.len(0,100).validate(null).valid === false;
```







----------------------------------------------------------------------

### itsa.lowercase()

Validates that a string does not contain uppercase characters A-Z.

No changes are made to the original string, only validation.

##### Example

``` js
itsa.lowercase().validate("abcdefg").valid === true;
itsa.lowercase().validate("a-b.c").valid === true;
itsa.lowercase().validate(34).valid === false;
itsa.lowercase().validate("abcABC").valid === false;
```






----------------------------------------------------------------------

### itsa.minLength(min)

This validation succeeds if your data has a length property and that length is >= the given min.

If you omit a min value number then an error will be thrown.

If you need the length to be within a range, use the `.len(...)` validator.

##### Arguments

 - `min` - Required. number. The minimum length allowed

##### Examples

``` js
//valid
itsa.minLength(3).validate([7,42,1,2]).valid === true;
itsa.minLength(3).validate("blue").valid === true;
itsa.minLength(3).validate({length:5}).valid === true;

//invalid
itsa.minLength(3).validate(null).valid === false;
itsa.minLength(3).validate([7,42]).valid === false;
itsa.minLength(3).validate({length:1}).valid === false;
```





----------------------------------------------------------------------

### itsa.maxLength(max)

This validation succeeds if your data has a length property and that length is <= the given max.

If you omit a max value number then an error will be thrown.

If you need the length to be within a range, use the `.len(...)` validator.

##### Arguments

 - `max` - Required. number. The maximum length allowed

##### Examples

``` js
//valid
itsa.maxLength(3).validate([7,42]).valid === true;
itsa.maxLength(3).validate({length:1}).valid === true;

//invalid
itsa.maxLength(3).validate([7,42,1,2]).valid === false;
itsa.maxLength(3).validate("blue").valid === false;
itsa.maxLength(3).validate(null).valid === false;
```








----------------------------------------------------------------------

### itsa.nan()

Valid only if the value is `NaN` (using the isNaN check).

If you want to allow all falsy values, use the `.falsy()` validator. If you want to
validate positive or negative infinity, use the `.equal(...)` validator.

##### Examples

``` js
itsa.nan().validate(NaN).valid === true;
itsa.nan().validate(parseInt("red")).valid === true;
itsa.nan().validate(1/0).valid === false; //+Infinity
itsa.nan().validate(0).valid === false;
```







----------------------------------------------------------------------

### itsa.notEmpty()

Valid for arrays with at least one item, objects with at least one key, or strings with length > 0. Any other value is invalid.

##### Examples

``` js
itsa.notEmpty().validate([42]).valid === true;
itsa.notEmpty().validate({name:"Bob"}).valid === true;
itsa.notEmpty().validate("red").valid === true;
itsa.notEmpty().validate([]).valid === false;
itsa.notEmpty().validate({}).valid === false;
itsa.notEmpty().validate("").valid === false;
itsa.notEmpty().validate(true).valid === false;
itsa.notEmpty().validate(1).valid === false;
```








----------------------------------------------------------------------

### itsa.null()

Valid only if the value is strictly equal to `null`.

If you want to allow all falsy values, use the `.falsy()` validator. If you want to
validate `undefined` then use the `.undefined()` validator.

##### Examples

``` js
itsa.null().validate(null).valid === true;
itsa.null().validate(0).valid === false;
itsa.null().validate({}).valid === false;
itsa.null().validate(NaN).valid === false;
itsa.null().validate(undefined).valid === false;
itsa.null().validate().valid === false;
```






----------------------------------------------------------------------

### itsa.number()

Valid for any JavaScript number except `NaN`, `Number.NEGATIVE_INFINITY`, and `Number.POSITIVE_INFINITY`. If you
want to include those values, use the `.typeof(...)` validator.

##### Examples

``` js
itsa.number().validate(3).valid === true;
itsa.number().validate(-344).valid === true;
itsa.number().validate(0).valid === true;
itsa.number().validate(3.0).valid === true;
itsa.number().validate(3.5).valid === true;
itsa.number().validate(null).valid === false;
itsa.number().validate("3").valid === false;
itsa.number().validate([]).valid === false;
itsa.number().validate(NaN).valid === false;
itsa.number().validate(Number.NEGATIVE_INFINITY).valid === false;
itsa.number().validate(Number.POSITIVE_INFINITY).valid === false;
```





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

### itsa.over(value [, inclusive])

Valid when the data is more than (`>`) the value.

By default, the comparison is not inclusive, but you can pass `true` as the second value to do an inclusive (`>=`) comparison instead.

If you need to do a range check, use the `.between(...)` validator.

##### Arguments

 - `value` - Required. The minimum number, date, string, etc allow (not inclusive)
 - `inclusive` - Optional. Default `false`. `true` makes the comparison check inclusive.

##### Examples

``` js
//exclusive
itsa.over(5).validate(8).valid === true;
itsa.over(5).validate(5).valid === false;
itsa.over(new Date(1222563421430)).validate(new Date()).valid === true;
itsa.over("b").validate("c").valid === true;
itsa.over("b").validate("a").valid === false;

//inclusive
itsa.over(5, true).validate(5).valid === true;
itsa.over("a", true).validate("a").valid === true;
```







----------------------------------------------------------------------

### itsa.regexp()

Valid when the data is a JavaScript `RegExp` object.

##### Examples

``` js
itsa.regexp().validate(/a+/).valid === true;
itsa.regexp().validate(new RegExp("a+")).valid === true;

itsa.regexp().validate("a+").valid === false;
itsa.regexp().validate(42).valid === false;
```









----------------------------------------------------------------------

### itsa.startsWith(value)

Performs an `indexOf` check on strings and arrays to see if the given value is found at the very beginning.

##### Arguments

 - `value` - Required. The value (string or array item) that should be found at the beginning of your data.

##### Examples

``` js
itsa.startsWith("red").validate("redbird").valid === true;
itsa.startsWith(42).validate([42, 5]).valid === true;
itsa.startsWith("red").validate("bigred").valid === false;
itsa.startsWith(42).validate([5, 42]).valid === false;
itsa.startsWith(null).validate(null).valid === false;
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

### itsa.true()

Valid strictly when the value is the JavaScript boolean `true`. To validate truthy values, use the `.truthy()` validator.

##### Examples

``` js
itsa.true().validate(true).valid === true;
itsa.true().validate(1).valid === false;
itsa.true().validate("red").valid === false;
```








----------------------------------------------------------------------

### itsa.truthy()

Valid for values who are "truthy". In other words, values who evaluate to `true` when converted to
a boolean via JavaScript's implicit type casting.

##### Examples

``` js
itsa.truthy().validate(true).valid === true;
itsa.truthy().validate(1).valid === true;
itsa.truthy().validate("red").valid === true;
itsa.truthy().validate([]).valid === true;
itsa.truthy().validate(false).valid === false;
itsa.truthy().validate(0).valid === false;
itsa.truthy().validate(null).valid === false;
itsa.truthy().validate(undefined).valid === false;
```








----------------------------------------------------------------------

### itsa.typeof(type)

Runs a typeof check on your data and is valid when the result matches the given type.

Keep in mind that `typeof []`, `typeof null`, `typeof new Date` all equal `"object"`. So if you want
a more strict type check then use validators like `itsa.array()` or `itsa.null()`.

##### Arguments

 - `type` - Required. A string that is the expected type for your data. Ie. `"object"`.

##### Examples

``` js
itsa.typeof("boolean").validate(true).valid === true;
itsa.typeof("string").validate("hello").valid === true;
itsa.typeof("object").validate([]).valid === true;
```








----------------------------------------------------------------------

### Type Classes

When you're validating nested data, you can use JavaScript type classes
like `String`, `RegExp`, `Boolean`, `Array`, `Number`, `Date`, `Object`,
or `Function` to verify the data's type.

Each check parallels its matching `itsa` validator. For example `Date` is
like `itsa.date()` and will only match valid dates. If you want to do an
`instanceof` check use `itsa.instanceof(...)` or `itsa.typeof(...)`.


##### Example

```js
itsa.any(String, Number).validate("red").valid === true;
itsa.object({age:Number}).validate({age:42}).valid === true;
itsa.object({age:Date}).validate({age:new Date("invalid")}).valid === false;
```







----------------------------------------------------------------------

### itsa.undefined()

Valid only if the value is strictly equal to `undefined`.

If you want to allow all falsy values, use the `.falsy()` validator. If you want to
validate `null` then use the `.null()` validator. You may also find it helpful to
use `itsa.any(null, undefined)`.

##### Examples

``` js
itsa.undefined().validate(undefined).valid === true;
itsa.undefined().validate(0).valid === false;
itsa.undefined().validate({}).valid === false;
itsa.undefined().validate(NaN).valid === false;
itsa.undefined().validate(null).valid === false;
itsa.undefined().validate().valid === false;
```







----------------------------------------------------------------------

### itsa.under(value [, inclusive])

Valid when the data is less than (`<`) the value.

By default, the comparison is not inclusive, but you can pass `true` as the second value to do an inclusive (`<=`) comparison instead.

If you need to do a range check, use the `.between(...)` validator.

##### Arguments

 - `value` - Required. The max number, date, string, etc allow (not inclusive)
 - `inclusive` - Optional. Default `false`. `true` makes the comparison check inclusive.

##### Examples

``` js
//exclusive
itsa.under(5).validate(3).valid === true;
itsa.under(5).validate(5).valid === false;
itsa.under(new Date()).validate(new Date(1222563421430)).valid === true;
itsa.under("b").validate("a").valid === true;
itsa.under("b").validate("c").valid === false;

//inclusive
itsa.under(5, true).validate(5).valid === true;
itsa.under("a", true).validate("a").valid === true;
```







----------------------------------------------------------------------

### itsa.unique(getter)

Valid only for arrays, objects, or strings where each item (or field value, or character) is unique according to a strict
equality test (`===`).

##### Arguments

 - `getter` - Optional. A function that recieves the item and should return the value that should be compared by uniqueness. If a value is given other than a function, then it is used to pluck the value to be evaluated.

##### Example

``` js
//Array
itsa.unique().validate([]).valid === true;
itsa.unique().validate([1,2,3]).valid === true;
itsa.unique().validate([1,2,2]).valid === false;

//Object
itsa.unique().validate({}).valid === true;
itsa.unique().validate({a:1,b:2,c:3}).valid === true;
itsa.unique().validate({a:1,b:2,c:2}).valid === false;

//String
itsa.unique().validate("").valid === true;
itsa.unique().validate("abc").valid === true;
itsa.unique().validate("aab").valid === false;

```

##### Getter Example

``` js
itsa.unique(function(obj){ return obj.id; }).validate([{id:11},{id:12}]).valid === true;
itsa.unique(function(obj){ return obj.id; }).validate([{id:11},{id:11}]).valid === false;
```

##### Pluck Example

``` js
itsa.unique("id").validate([{id:11},{id:12}]).valid === true;
itsa.unique("id").validate([{id:11},{id:11}]).valid === false;
```






----------------------------------------------------------------------

### itsa.uppercase()

Validates that a string does not contain lowercase characters a-z.

No changes are made to the original string, only validation.

##### Example

``` js
itsa.uppercase().validate("ABCDEFG").valid === true;
itsa.uppercase().validate("A-B.C").valid === true;
itsa.uppercase().validate(34).valid === false;
itsa.uppercase().validate("abcABC").valid === false;
```




# Updaters

In some cases, you may want to actually set, update, default, or otherwise change the data that is being validated.

`to` lets you modify the original value while `default` lets you define a value if the original was falsy.

NOTE: changed data must be inside a parent object or array, otherwise there is no way to set the new value

```js
//DO NOT DO THIS (IT WON'T WORK)
itsa.defaultNow().validate("test");

//This works!
var user = {};
itsa.object({
  created: itsa.defaultNow()
}).validate(user);
user.created // is new Date()
```

As always, order matters. For example, you'd probably want to trim a string before you validate it, so you should
call `itsa.toTrimmed().email()...`.

Also, updaters like `to` or `default` are not transactional. In other words, `itsa` will update values as it is
validating your data. It has to do this since validations may depend on updated data. If you want an "all or nothing"
approach then consider cloning your data before the validation.




----------------------------------------------------------------------

### itsa.to(valueOrGetter)

Use `.to(...)` to change a value.

NOTE: `to` can only be used within a parent object

All itsa validators that change a value begin with either "default" or "to".

##### Arguments

 - `valueOrGetter` - Required. The new value or a function that returns the new value.

If you provide a function, then it will receive the current value and should return the new value. If you
wish to leave the value unchanged, then return the same value you receive. In other words, returning `undefined`
will set the value to `undefined`.

##### Setting A Brand New Value

You might use this if you have an `updated` field that should always have the latest date:

``` js
var currentDate = function(val){ return new Date(); };
var validator = itsa.object({
  updated: itsa.to(currentDate)
});

var obj = { updated: new Date(0) };
obj.updated; //1970
validator.validate(obj);
obj.updated; //now
```

##### Changing The Original Data

Instead of blindly overriding a value, you may want to change the data based on its current value.
For example, maybe you want a chance to do some type conversion before you run your validators. Your
updater function will receive the current value as the first parameter.

``` js
var int = function(val){ return parseInt(val); };
var validator = itsa.object({
  age: itsa.to(int).number()
});

var obj = { age: "18" };
validator.validate(obj).valid === true;
obj.age === 18;
```








----------------------------------------------------------------------

### itsa.toDate()

Tries to convert your data into a date using `new Date(data)`. If the resulting date is valid, then it will replace your original data. Otherwise
the validator will fail.

Additionally, falsy values are automatically considered invalid dates as well as arrays. For example `new Date(null)` evaluates to 1970, but here it would be considered invalid.
Similarly, `new Date([1])` is technically considered `new Date("1")`, but here it is invalid because it is an array.

WARNING: Parsing dates is [inconsistent](http://dygraphs.com/date-formats.html). Your best option is to parse the date yourself using a `.to` validator.

##### Examples

```js
var obj = {started:"2012/03/13"};
itsa.object({ started: itsa.toDate() }).validate(obj).valid === true;
obj.started === new Date("2012/03/13");
```

```js
var obj = {started:"today"};
itsa.object({ started: itsa.toDate() }).validate(obj).valid === false;
obj.started === "today";
```

##### MomentJS Example

Your best option for parsing dates is [`momentjs`](http://momentjs.com/docs/#/parsing/). Here's how:

```js
var moment = require("moment");
var toDate = function(val, setter){
  if (!setter) { throw "Cannot set a value outside of an object or array."; }

  var date = moment.parse(val, "YYYY/MM/DD");
  if (date.isValid()){
    setter(date.toDate());
  }else{
    return "Unable to convert to a date.";
  }
};

var obj = { started:"2012/03/13" };
itsa.object({
  val: itsa.to(toDate)
}).validate(obj).valid === true;
obj.val === new Date("2012/03/13");
```








----------------------------------------------------------------------

### itsa.toFloat()

Tries to convert the data to an float, using `parseFloat`. If the result would be `NaN` then the validation will fail and the value will be unchanged.

##### Success Example

```js
var validator = itsa.object({
  age: itsa.toFloat()
});

var obj = {gpa:"3.5"};
validator.validate(obj).valid === true;
obj.gpa === 3.5;
```

##### Failure Example

```js
var validator = itsa.object({
  gpa: itsa.toFloat()
});

var obj = {gpa:"B"};
validator.validate(obj).valid === false;
obj.gpa === "B";
```








----------------------------------------------------------------------

### itsa.toInteger(radix)

Tries to convert the data to an integer, using `parseInt`. If the result is `NaN` then the validation will fail and the value will be unchanged.

NOTE: If you omit the radix, it defaults to 10. Older versions of `parseInt` would guess the radix, but that is not allowed here.

##### Arguments

 - `radix` - Optional. Default is 10. The base of the number to be parsed.

##### Success Example

```js
var validator = itsa.object({
  age: itsa.toInteger()
});

var obj = {age:"08"};
validator.validate(obj).valid === true;
obj.age === 8;
```

##### Failure Example

```js
var validator = itsa.object({
  age: itsa.toInteger()
});

var obj = {age:"young"};
validator.validate(obj).valid === false;
obj.age === "young";
```








----------------------------------------------------------------------

### itsa.toLowercase()

If the data is a string, then it will be forced to lowercase. No validation is done.

NOTE: if you wish to validate a string's case, use `.lowercase(...)`.

##### Example

```js
var validator = itsa.object({
  username: itsa.string().toLowercase()
});

var obj = {username:"Bob"};
validator.validate(obj).valid === true;
obj.username === "bob";
```








----------------------------------------------------------------------

### itsa.toNow()

Similar to `to` and `defaultNow`, this *always* sets a value to `new Date()`.

##### Examples

```js
var validator = itsa.object({
  updated: itsa.toNow().date()
});

var obj = {updated:"yesterday"};
validator.validate(obj);
obj.updated; //new Date()
```








----------------------------------------------------------------------

### itsa.toString()

Replaces the original value with a toString version of the value. Conversion never fails or causes invalidation
 because `String(data)` is used.

##### Examples

```js
var convert = function (val) {
  var obj = {val:val};
  itsa.object({
    val: itsa.toString()
  }).validate(obj);
  return obj.val;
};

convert("Bob") === "Bob";
convert(42) === "42";
convert() === "undefined";
convert(undefined) === "undefined";
convert(null) === "null";
convert([]) === "";
convert([1,2]) === "1,2";
convert({a:1}) === "[object Object]";
```








----------------------------------------------------------------------

### itsa.toTrimmed()

If the data is a string, then leading and trailing whitespace will be trimmed using `String.prototype.trim()`.

##### Example

```js
var validator = itsa.object({
  email: itsa.toTrimmed().email()
});

var obj = {email:" bob@example.com  "};
validator.validate(obj).valid === true;
obj.email === "bob@example.com";
```








----------------------------------------------------------------------

### itsa.toUppercase()

If the data is a string, then it will be forced to uppercase. No validation is done.

NOTE: if you wish to validate a string's case, use `.uppercase(...)`.

##### Example

```js
var validator = itsa.object({
  employeeNumber: itsa.string().toUppercase()
});

var obj = {employeeNumber:"bobb8463"};
validator.validate(obj).valid === true;
obj.employeeNumber === "BOBB8463";
```









----------------------------------------------------------------------

### itsa.default(defaultValue)

`default` lets you set a value, but only if the original value was falsy.

NOTE: Data changes (like `default` and `to`) can only be used within an object or array - otherwise itsa has no way of actually setting the new value.

##### Arguments

 - `defaultValue` - Required. The value to become the new value if the original is falsy. If your defaultValue is a function, then it will be evaluated and the result is the new value.

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

### itsa.defaultNow()

Similar to `default`, this sets a value to `new Date()` if the original value is falsy.

##### Examples

```js
var validator = itsa.object({
  created: itsa.defaultNow().date()
});

var obj = {};
validator.validate(obj);
obj.created; //new Date()
```










# Extending Itsa

Using `.custom(...)` validators are great for special, one-off validations.

Using `.to(...)` is a great way to do one-off data updates.

If you find yourself using `custom` or `to` quite a bit, then you may want to extend the itsa object with your custom validator.

This means you'll be able to call your validator like a first-class validator (ie. `itsa.number().myValidator()...`).

Your validator will be able to return an error message and/or update the original value.

##### Validator Example

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


##### Updater Example

Similarly, you can also add an extension that is able to update the original value.

The second parameter passed to your checker function is a setter function. Keep in mind, this setter
may be undefined if your validator is used without a parent object or array.  To update the value, just
call the setter function with your new value.

``` js
//extending itsa
itsa.extend({
  randomFloat: function builder() {
    return function checker(val, setter) {
      if (!setter) { throw "Setters cannot be used without an object or array parent."; }
      setter(Math.random());
    };
  }
});

//using the new extension
var obj = {};
var validator = itsa.object({
  foo: itsa.randomFloat()
});
validator.validate(obj);
obj.foo === 0.8437536523;
```





# Aliasing Validators

If you find a validator name appaulling, then you can create an alias
by calling `itsa.alias`.

#### itsa.alias(oldName, newName)

 - `oldName` - Required. String. The built in name of the validator.
 - `newName` - Required. String. The new name for the validator.

##### Example

``` js
itsa.alias("integer", "int");
itsa.int().validate(3).valid === true;
```










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






# Pull Requests

Pull requests are welcome for:

 - bugs
 - new validators that would be commonly useful
 - features that make sense
 - readme typos, clarity

For code changes, please include appropritate tests. You can run tests by cloning the repo,
run `npm install`, and then `npm test`.

##### New Validators

To add a new validator:

 - Explain the new validator to the readme and to the table of contents
 - Create a new test in `/test` that verifies the behavior
 - Create the new validator in `/lib/validators`. `matches.js` is a good example.
 - Register the validator to `/lib/index.js`
 - Make sure tests are successful




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


# Testing

Testing is done with mocha and is monitored with Travis CI (see the badge at the top of the page).
At last count, there were over 200 tests that document and verify the `itsa` library.
You can run the tests by running `npm run test`.


# License

[MIT](https://github.com/bendytree/node-itsa/blob/master/LICENSE)



