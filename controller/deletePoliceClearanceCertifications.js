const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function deletePoliceClearanceCertifications({id}) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();
    plcclr
    .policeClearanceCertifications()
    .deleteRecord(id)
    .then(result => resolve(result))
    .catch(err => reject(err));
  });
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  const {body} = req;

  if (validatorError.isEmpty()) {
    deletePoliceClearanceCertifications(body)
    .then(result => {
      console.log(result);
      console.log('success');
      resJSON.default(OK, {data: []}, res);
    })
    .catch(err => {
      console.log(err);
      console.log('error');
      resJSON.serverError({error: err.message}, res);
    })
  } else {
    resJSON.inputError({error: validatorError.mapped()}, res);
  }
}