window.strand = (function () {

  // Runs a strand.
  function run(generator, yielded, onend) {
    // A non-function yield is treated as a return.
    if (yielded && typeof yielded === 'function') {
      var callforward = function () {
        var args = Array.prototype.slice.call(arguments), result;
        try {
          if (callforward.__exc) {
            // If __exc has been set, forward exception through to the generator.
            result = generator.throw(callforward.__exc);
          } else {
            // Otherwise forward on the arguments.
            result = generator.send(args);
          }

          // Recur to process the next yield.
          run(generator, result, onend);
        } catch (err if err instanceof StopIteration) {
          onend();
        } catch (err) {
          onend.throw(err);
        }
      };

      // Add a function to allow exception to be thrown 
      callforward.throw = function (exc) {
        this.__exc = exc;
        this();
      };

      yielded(callforward);
    } else {
      // Close the generator and return the result.
      generator.close();
      onend(yielded);
    }
  }

  // Strand wrapper function.
  return function (strand) {
    // Return the wrapped function.
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var onend = args[args.length - 1];
      var passed;
      if (typeof onend != "function") {
        passed = args;
        onend = function(){};
      } else {
        passed = args.slice(0, args.length - 1);
      }

      if (!onend.throw) {
        onend.throw = function(exc) {
          throw exc;
        };
      }

      var generator = strand.apply({}, passed);
      
      try {
        run(generator, generator.next(), onend);
      } catch (err if err instanceof StopIteration) {
        onend();
      } catch (exc) {
        onend.__exc = exc;
        onend();
      }
    }
  }
}());