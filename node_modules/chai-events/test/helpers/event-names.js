const jsc = require("jsverify");

const { arbitraryKeyword } = require("./event-keywords");
const stringToSymbol = require("./string-to-symbol");

const arbitraryEventNameString = jsc.oneof([
  jsc.nestring,
  arbitraryKeyword,
]);

const arbitraryEventName = jsc.oneof([
  arbitraryEventNameString,
  stringToSymbol(arbitraryEventNameString),
]);

module.exports = {
  arbitraryEventNameString,
  arbitraryEventName,
};
