function stringToSymbol(arb) {
  return arb.smap(
    str => Symbol(str),
    symbol => symbol.toString()
  );
}

module.exports = stringToSymbol;
