"use strict";
const chai = require("chai");
const should = chai.should();
const jsc = require("jsverify");
const delay = require("delay");

chai.use(require("../chai-events"));

const { arbitraryEventName } = require("./helpers/event-names");

const EventEmitter = require("events");

const nodeEmitter = () => new EventEmitter();

const anyEmitter = jsc.oneof([
  jsc.constant(nodeEmitter),
]);

const nonEventEmitter = jsc.oneof([
  jsc.constant(() => 1),
  jsc.constant(() => "hello"),
  jsc.constant(() => { x: 1 }),
]);

const shouldEmit = emitter => emitter.should.emit;
const shouldNotEmit = emitter => emitter.should.not.emit;

const anyCheck = jsc.oneof([
  jsc.constant(shouldEmit),
  jsc.constant(shouldNotEmit),
]);

const arbitraryEventData = jsc.oneof([
  jsc.constant(true),
]);

describe("x.should", function() {

  describe(".not.emit", function() {

    jsc.property(
      "fails if given a non-event-emitter",
      nonEventEmitter, arbitraryEventName,
      (emitter, eventName) => {
        try {
          emitter.should.not.emit(eventName);
          return false;
        } catch (err) {
          return true;
        }
      }
    );

    describe("confirms events don't fire", function() {
      let run = 0;
      jsc.assertForall(
        anyEmitter, arbitraryEventName,
        (emitter, eventName) => {
          it(`run ${++run}`, function() {
            return emitter().should.not.emit(eventName, { timeout: 50 });
          });
          return true;
        }
      );
    });

    jsc.property(
      "fails if event is sent",
      anyEmitter, arbitraryEventName,
      (emitter, eventName) => {
        const eventEmitter = emitter();
        const check = eventEmitter.should.not.emit(eventName);
        eventEmitter.emit(eventName);
        return check
          .then(() => should.fail("Check failed"))
          .catch(err => true);
        return (function() {
          const check = eventEmitter.should.not.emit(eventName);
          eventEmitter.emit(eventName);
          return check;
        }).should.throw();
        return true;
      }
    );

    it("returns a resolving promise if the event isn't emitted", function() {
      const emitter = nodeEmitter();
      const check = emitter.should.emit("eventA", { timeout: 50 });
      check.should.be.a("promise");
      return check
        .then(() => should.fail("Check should have failed."))
        .catch(err => true);
    });

    it("returns a rejecting promise if the event is emitted", function() {
      const emitter = nodeEmitter();
      const check = emitter.should.emit("eventA");
      check.should.be.a("promise");
      emitter.emit("eventA");
      return check
        .then(() => should.fail("Check should have failed."))
        .catch(err => true);
    });

  });

  describe(".emit", function() {

    jsc.property(
      "fails if given a non-event-emitter",
      nonEventEmitter, arbitraryEventName,
      (emitter, eventName) => {
        try {
          emitter.should.emit(eventName);
          return false;
        } catch (err) {
          return true;
        }
      }
    );

    jsc.property(
      "listens for immediately emitted events",
      anyEmitter, arbitraryEventName, arbitraryEventData,
      (emitter, eventName, eventData) => {
        emitter = emitter();
        const p = emitter.should.emit(eventName);
        emitter.emit(eventName, eventData);
        return p.then(() => true);
      }
    );

    it("returns a resolving promise if event emitted", function() {
      const emitter = nodeEmitter();
      const check = emitter.should.emit("eventA");
      check.should.be.a("promise");
      emitter.emit("eventA");
      return check;
    });

    it("returns a rejecting promise if event not emitted", function() {
      const emitter = nodeEmitter();
      const check = emitter.should.emit("eventA", { timeout: 50 });
      check.should.be.a("promise");
      return check
        .then(() => should.fail("Check should have failed."))
        .catch(err => true);
    });

  });

});
