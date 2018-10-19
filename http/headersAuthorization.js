const config = require('config');
const resJSON = require('./resJSON');

const {
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
  getStatusText,
} = require('http-status-codes');

module.exports = (req, res, next) => {
  const apiRef = config.get('api');
  const { authorization } = req.headers;

  if (apiRef.key === authorization) {
    next();
  } else {
    const err = new Error(getStatusText(UNAUTHORIZED));
    resJSON.default(UNAUTHORIZED, {error: err}, res);
  }
}