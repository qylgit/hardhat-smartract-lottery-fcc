function plugin(chai, utils) {

  var Assertion = chai.Assertion;

  /**
   * Checks if a given entry is an event emitter.
   * Uses EventEmitter or EventTarget if available to quickly check `instanceof`.  Otherwise, checks that common methods
   * to event emitters are available.
   *
   * Gracefully handles custom implementations of event emitters even if EventEmitter or EventTarget are available,
   * checking methods if the emitter doesn't inherit from the global emitter.
  */
  function isEmitter() {
    // Easy check: if Node's EventEmitter or window.EventEmitter exist, check if this is an instance of it.
    if(typeof EventEmitter !== "undefined" && EventEmitter !== null && this._obj instanceof EventEmitter) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Easy check: if the browser's EventTarget exists, check if this is an instance of it.
    if(typeof EventTarget !== "undefined" && EventTarget !== null && this._obj instanceof EventTarget) {
      return this.assert(true, "", "expected #{this} to not be an EventTarget");
    }

    var obj = this._obj;

    // Check for Node.js style event emitters with "on", "emit", etc.
    var node = ["on", "emit"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(node) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    // Check for Browser-based event emitters with "addEventListener", etc.
    var browser = ["addEventListener", "dispatchEvent", "removeEventListener"].every(function(method) {
      return typeof obj[method] === "function";
    });

    if(browser) {
      return this.assert(true, "", "expected #{this} to not be an EventEmitter");
    }

    this.assert(false, "expected #{this} to be an EventEmitter", "");
  };

  Assertion.addProperty("emitter", isEmitter);
  Assertion.addProperty("target", isEmitter);

  Assertion.addMethod("emit", function(name, args) {
    const timeout = typeof args === "object" && typeof args.timeout === "number" ? args.timeout : 1500;
    const obj = utils.flag(this, "object");

    new Assertion(this._obj).to.be.an.emitter;

    new Assertion(name).to.satisfy(function(_name) {
        return typeof _name === 'string' || typeof _name === 'symbol';
    });

    const assertEmission = expr => this.assert(
      expr,
      `expected #{this} to emit message with key '${name.toString()}'`,
      `expected #{this} to not emit message with key '${name.toString()}'`
    );

    return new Promise((resolve, reject) => {
      let done = false;

      obj.once(name, (...args) => {
        if(done) {
          return;
        }
        done = true;

        try {
          assertEmission(true); // Will throw error if action is unexpected.
          resolve(args);
        } catch (err) {
          reject(err);
        }
      });

      setTimeout(() => {
        if(done) {
          return;
        }
        done = true;

        try {
          assertEmission(false); // Will throw error if action is unexpected.
          resolve();
        } catch (err) {
          reject(err);
        }
      }, timeout);
    });
  });

}

if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
  module.exports = plugin;
}
else if (typeof define === "function" && define.amd) {
  define(function () {
    return plugin;
  });
}
else {
  // Other environment (usually <script> tag): plug in to global chai instance directly.
  chai.use(plugin);
}
