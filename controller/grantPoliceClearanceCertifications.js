const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const bluebird = require('bluebird');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function grantCertifications({
  plcclrId,
  machineId,
  station,
  applicantId,
  findings,
  purpose,
  verifiedBy,
  certifiedBy,
}) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();
    plcclr.certificates()
    .grantCertificate({
      plcclrId,
      machineId,
      station,
      applicantId,
      findings,
      purpose,
      verifiedBy,
      certifiedBy,
    })
    .then(([result]) => resolve(result))
    .catch(err => reject(err));
  });
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  if (validatorError.isEmpty()) {
    const {body} = req;

    grantCertifications(body)
    .then(result => {
      console.log('success');
      resJSON.default(OK, {data: result}, res);
    })
    .catch(err => {
      console.log(err);
      console.log('error');
      resJSON.errorServer({error: err.message}, res);
    })
  } else {
    console.log(validatorError.mapped());
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
};