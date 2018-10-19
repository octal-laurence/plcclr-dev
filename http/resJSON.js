const {OK, INTERNAL_SERVER_ERROR, NOT_FOUND} = require('http-status-codes');

module.exports = {
  default: (code, input = {}, res) => {
    res.status(code);
    res.json(input);
  },
  errorServer: (input = {}, res) => {
    res.status(INTERNAL_SERVER_ERROR);
    res.json(input);
  },
  errorInput: (input = null, res) => {
    res.status(NOT_FOUND);
    res.json(input);
  }
}