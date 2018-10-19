const crypto = require('crypto');
const moment = require('moment');

exports.getMeTokenDefault = (input='') => {
  const tokenLength = 60;
  const tokenKey = crypto.createDiffieHellman(tokenLength).generateKeys('base64');
  const timeStamp = new Date();
  return crypto.createHmac('sha256', [tokenKey,timeStamp].join('+')).update(input).digest('base64');
}

exports.dateMoment = (date, formatted) => {
  return moment(date).format(formatted); 
}

exports.dateFormat = {
  default: 'YYYY-MM-DD HH:mm:ss.SSS',
  orientdb: 'YYYY-MM-DD HH:mm:ss',
  simple: 'MM/DD/YYYY h:mm:ss A',
  bday:  'MM-DD-YYYY',
  MDY: 'MM/DD/YYYY',
};