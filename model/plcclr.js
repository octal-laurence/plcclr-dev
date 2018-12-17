const orientdb = require('../api_services/orientdbRest');

const {PoliceClearanceCertifications} = require('./class/policeClearanceCertifications');

class Plcclr {
  constructor(opts = {}) {
    const DB = new orientdb.DB();
    this._policeClearanceCertifications = new PoliceClearanceCertifications(DB);
  }
  policeClearanceCertifications() {
    return this._policeClearanceCertifications;
  }
}

exports.Plcclr = Plcclr;