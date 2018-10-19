const config = require('config');
const ODatabase = require('orientjs').ODatabase;

class DB {
  constructor(opt={}) {
    this._dbRef = config.get('orientdb');
  }
  connect() {
    const db = new ODatabase({
      host: this._dbRef.host,
      port: this._dbRef.port,
      name: this._dbRef.name,
      username: this._dbRef.username,
      password: this._dbRef.password,
    });

    return db.open();
  }
}

exports.DB = DB;