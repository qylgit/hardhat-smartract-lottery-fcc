const jsc = require("jsverify");

const words = [
  "test",
  "event",
  // Common keywords:
  "load",
  "error",
  "online",
  "offline",
  "focus",
  "message",
  "close",
  "DOMContentLoaded",
  "connection",
  // Edge cases(?)
  "on",
  "off",
  "listen",
];

const arbitraryKeyword = jsc.oneof(words.map(jsc.constant));

module.exports = {
  words,
  arbitraryKeyword,
};
