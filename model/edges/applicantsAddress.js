const helper = require('../../helper/util');

class EdgeApplicantsAddress {
  constructor(database) {
    this._db = database;
    this._tbl = 'applicantsAddress';
  }
}

exports.EdgeApplicantsAddress = EdgeApplicantsAddress;
exports.tbl = new EdgeApplicantsAddress()._tbl;