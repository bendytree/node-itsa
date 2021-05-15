
# itsa - v2

> Pronounced "it's a". As in... it's a number.

`itsa` is a JavaScript data validation library. This is version 2 which has been completely re-written and is basically an all new library.

###### Features

 - Client side & server side
 - JavaScript or TypeScript
 - 100% Test Coverage (Mocha)
 - Composable
 - Extensible
 - No dependencies
 - 14KB minified, 4KB Gzip
 - Convert/default data in-place
 - Bail on first error or get all errors
 - Get paths & messages for each error
 - Serialize/deserialize to/from json
 - Partial verification (for updates)

###### Simple Example

```js
const { itsa } = require("itsa");

itsa.number().validate('foo').ok === false;
```

###### Complex Example

```js
const { itsa } = require("itsa");

const schema = itsa.object({
  name: itsa.string(),
  email: itsa.email(),
  age: itsa.any(
    itsa.number().between(18, 200),
    null,
    undefined,
  ),
  colors: itsa.array(
    itsa.any("red", "green", "blue"),
  ).notEmpty(),
});

const result = schema.validate({ name: "Bob", email: "bob@example.com" });
result.ok === false;
result.message === "colors: must be an array";
```


## Table of Contents

- [Installation](#installation)
- [How It Works](#how-it-works)
- [Required vs Optional](#required-vs-optional)
- [Validating](#validating)
- [Validators](#validators)
    - [after](#itsaaftervalue--inclusive)
    - [alphanumeric](#itsaalphanumeric)
    - [any](#itsaanyvalidator--validator)
    - [anything](#itsaanythingvalidator--validator)
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
    - [if](#itsaif)
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

#### With NPM

    > npm install itsa

``` js
const { itsa } = require('itsa');
```

#### Without NPM

If you don't use NPM, then use [`dist/itsa.js`](https://raw.githubusercontent.com/bendytree/node-itsa/master/dist/itsa.js) for development (it has source maps) and
use [`dist/itsa.min.js`](https://raw.githubusercontent.com/bendytree/node-itsa/master/dist/itsa.min.js) for production. There are no dependencies.

    > itsa.min.js - 14K minified, 4K gzipped


------------------------------------------------

# Required vs Optional

If you want to make a property optional, then you should use the `itsa.any` to list all
of the values that are valid.  Here's a simple example that shows the difference:

``` js
itsa.string().validate(null).ok === false;
itsa.any(itsa.string(), null).validate(null).ok === true;
```






# Validating

#### validate(value) -> result

Once you've built up your fancy validator, just call validate with your value.

It will return a result object that has `ok` set to true or false. `message` gives a description of the error. `errors` gives a full list of error objects. `value` gives the updated value (only different if you use a converter on the root object).

``` js
 const validator = itsa.string().maxLength(5);
 const result = validator.validate("Bob was here");
 result.ok === false;
 result.message ~== "Length is 12, max is 5";
```

#### validOrThrow(value)

As a shorthand, you can choose to automatically throw if the data is invalid:

```js
var doThing = function (criteria, callback) {
  //validate
  itsa.object({
    criteria: itsa.object(),
    callback: itsa.function()
  }).validOrThrow({
    criteria: criteria,
    callback: callback
  });

  //all good
};
```

# Available Methods

Todo: for now, check out files and tests in /src for a full listing.


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


