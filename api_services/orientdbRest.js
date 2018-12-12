const config = require('config');
const rp = require('request-promise');

class DB {
  constructor(opt={}) {
    this._dbRef = config.get('orientdb');
  }
  createRequest(type="command") {
    const { host, portHttp, name, username, password } = this._dbRef;
    const auth = `Basic ${new Buffer(`${username}:${password}`).toString("base64")}`;

    return {
      url: `http://${host}:${portHttp}/${type}/${name}/${(type === 'command') ? `sql`: ''}`, 
      headers: {
        Authorization: auth,
      }
    };
  }
  commandQuery(command, parameters = {}) {
    return rp.post({
      ...this.createRequest('command'),
      json: {
        command,
        parameters,
      }
    });
  }
  commandBatch(commands, parameters = {}) {
    return rp.post({
      ...this.createRequest('batch'),
      json: {
        transaction: true,
        operations: [{
          type: "script",
          language: "sql",
          script: commands
        }],
        parameters
      }
    })
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
}

exports.DB = DB;