const tbl = 'fingerPrints';
class FingerPrints {
  constructor(database) {
    this._db = database;
    this._tbl = tbl;
  }
}

module.exports = { FingerPrints, tbl };