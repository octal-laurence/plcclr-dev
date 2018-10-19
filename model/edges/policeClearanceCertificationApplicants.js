const helper = require('../../helper/util');

class EdgePoliceCleranceCertificationApplicants {
  constructor(database) {
    this._db = database;
    this._tbl = 'certificationApplicants';
  }
}

exports.EdgePoliceCleranceCertificationApplicants = EdgePoliceCleranceCertificationApplicants;
exports.tbl = new EdgePoliceCleranceCertificationApplicants()._tbl;