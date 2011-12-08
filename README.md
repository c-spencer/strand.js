# Strand.js

Strand.js uses generators (JS 1.7, ECMAScript Harmony / 6) to allow for a form of blocking asynchronous flow through a function.

## Browser support

Requires generators/yield, so currently only supported in Firefox. Examples also use destructuring. Script tags must have the `type="application/javascript;version=1.7"` attribute.

## Example

```javascript
// Dummy function for some async work of adding two numbers.
function make_async_work(a, b) {
  return function (callback) {
    setTimeout(function () {
      callback(a + b);
    }, 500);
  };
}

var strandFn = strand(function () {
  var result;

  [result] = yield make_async_work(5, 10);
  // result == 15

  [result] = yield make_async_work(result, 20);
  // result == 35

  // Can perform work asynchronously inside a closure.
  [result] = yield function(callback) {
    setTimeout(function () {
      callback(result + 10);
    }, 500);
  }
  // result == 45

  yield result + 5;
});

// Call the strand with a completion callback.
strandFn(function (return_value) {
  // return_value == 50
  console.log("Got result", return_value);
});
```

## Semantics

`yield` from a strand either returns a function to perform work, or a return value. Yielding a non-function value ends the strand, as does throwing an exception. The yielded function itself should take only a single argument, the completion callback, which passes what it is called with as the value of the yield.

## CoffeeScript fork plan

As and when time is found..

```coffeescript
strandFn = ~>
  [result] <~ make_async_work 5, 10
  # result == 15

  [result] <~ make_async_work result, 20
  # result == 35

  # Can perform work asynchronously inside a closure.
  [result] <~ callback
    setTimeout ->
      callback result + 10
    , 500
  # result == 45

  # implicit yield
  result3 + 5

# Call the strand with a completion callback.
strandFn (return_value) ->
  # return_value == 50
  console.log "Got result", return_value
```

## Contributors

Chris Spencer  
Grant Husbands