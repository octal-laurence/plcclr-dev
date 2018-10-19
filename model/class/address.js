const helper = require('../../helper/util');

class Address {
  constructor(database) {
    this._db = database;
    this._tbl = 'address';
  }
}

exports.Address = Address;
exports.tbl = new Address()._tbl;