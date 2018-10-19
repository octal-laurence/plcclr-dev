const helper = require('../../helper/util');

const policeClearanceCertifications = require('./policeClearanceCertifications');

class Applicants {
  constructor(database) {
    this._db = database;
    this._tbl = 'applicants';
  }
  list() {
    console.log(this._tbl);
  }
}

exports.Applicants = Applicants;
exports.tbl = new Applicants()._tbl;