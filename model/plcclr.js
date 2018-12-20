const orientdb = require('../api_services/orientdbRest');

const {PoliceClearanceCertifications} = require('./class/policeClearanceCertifications');
const {Certificates} = require('./class/certificates');

class Plcclr {
  constructor(opts = {}) {
    const DB = new orientdb.DB();
    this._policeClearanceCertifications = new PoliceClearanceCertifications(DB);
    this._certificates = new Certificates(DB);
  }
  policeClearanceCertifications() {
    return this._policeClearanceCertifications;
  }
  certificates() {
    return this._certificates;
  }
}

exports.Plcclr = Plcclr;