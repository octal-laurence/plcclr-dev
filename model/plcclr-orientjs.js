const orientdb = require('../api_services/orientdb');
const DB = new orientdb.DB();

const {PoliceClearanceCertifications} = require('./class/policeClearanceCertifications');
const {Applicants} = require('./class/applicants');

class Plcclr {
  constructor(opts) {
    this._db = DB;

    this._policeClearanceCertifications = PoliceClearanceCertifications;
    this._applicants = Applicants;
  }
  policeClearanceCertifications() {
    return new Promise((resolve, reject) => {
      this._db.connect()
      .then(_db => resolve(new this._policeClearanceCertifications(_db)))
      .catch(err => reject(err));
    });
  }
  applicants() {
    return new Promise((resolve, reject) => {
      this._db.connect()
      .then(_db => resolve(new this._applicants(_db)))
      .catch(err => reject(err));
    });
  }
  dataParser(input) {
    const cache = {};
    const json = JSON.stringify(input, function (key, value) {
      if (value && typeof value === 'object' && value["@rid"]) {
        if (cache[value["@rid"]]) {
          return value["@rid"];
        }
        cache[value["@rid"]] = value;
      }
      return value;
    });

    return JSON.parse(json);
  }
}

exports.Plcclr = Plcclr;