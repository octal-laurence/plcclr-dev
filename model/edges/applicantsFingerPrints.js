const tbl = 'applicantsFingerPrints';
class ApplicantsFingerPrints {
  constructor(database) {
    this._db = database;
    this._tbl = tbl;
  }
}

module.exports = { ApplicantsFingerPrints, tbl };