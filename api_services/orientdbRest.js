const config = require('config');
const rp = require('request-promise');

class DB {
  constructor(opt={}) {
    this._dbRef = config.get('orientdb');
  }
  createRequest(type='command', opts = '') {
    const { host, portHttp, db, username, password } = this._dbRef;
    const auth = `Basic ${new Buffer(`${username}:${password}`).toString("base64")}`;

    return {
      url: `http://${host}:${portHttp}/${type}/${db}/${opts}`, 
      headers: {
        Authorization: auth,
      }
    };
  }
  commandQuery(command, parameters = {}) {
    console.log(parameters);
    return rp.post({
      ...this.createRequest(`command`, `sql`),
      json: {
        command,
        parameters,
      }
    });
  }
  commandBatch(commands, parameters = {}) {
    return rp.post({
      ...this.createRequest(`batch`),
      json: {
        transaction: true,
        operations: [{
          type: "script",
          language: "sql",
          script: ((arrayCommands) => {
            if (Object.entries(parameters).length <= 0) {
              return arrayCommands
            }
            const newCommands = arrayCommands.map(command => {
              Object.entries(parameters)
              .map(([k, v]) => {
                command = command.replace(`:${k}`, `'${v}'`)
              })
              return command;
            })
            
            return newCommands;
          })(commands),
        }],
      }
    })
  }
  documentGet(rid) {
    const [, id] = rid.split("#");
    return rp.get({
      ...this.createRequest(`document`, `${id}/*:-1`),
    });
  }
  queryGet(sqlQuery, paramaters) {
    return rp.get({
      ...this.createRequest(`query`, `sql/${sqlQuery}`)
    });
  }
  testpost() {
    const auth = `Basic ${new Buffer(`root:iZl4w0ZMWsupfSSFbuWFMZk7kIMC6Aa/buiNmdogWm8=`).toString("base64")}`;
    rp.post(`http://ec2-54-189-181-33.us-west-2.compute.amazonaws.com:3100/command/demodb/sql`, {
      headers: {
        Authorization: auth,
      },
      json: {
        "command": "select from disciplinaryReports",
      }
    })
    .then(result => {
      console.log(result);
      console.log("success");
    })
    .catch(err => {
      console.log(err);
      console.log("error");
    })
  }
  testGet() {
    const { host, portHttp, db, username, password } = this._dbRef;
    const auth = `Basic ${new Buffer(`${username}:${password}`).toString("base64")}`;

    rp.get({
      url: `http://${host}:${portHttp}/document/${db}/12:174/*:1`, 
      headers: {
        Authorization: auth,
      }
    })
    .then(result => {
      console.log(result);
      console.log("success");
    })
    .catch(err => {
      console.log(err);
      console.log("error");
    }); 
  }
}

exports.DB = DB;