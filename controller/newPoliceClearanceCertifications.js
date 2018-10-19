const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function newPoliceClearanceCertifications({
  machineId,
  station,
  stationName,
  purpose,
  remarks,
  firstName,
  middleName,
  lastName,
  address1,
  address2,
  city,
  province,
  postalCode,
}) {
  const plcclr = new DB.Plcclr();
  
  return new Promise((resolve, reject) => {
    plcclr.policeClearanceCertifications()
    .then(comm => comm.newRecord({
      machineId,
      station,
      stationName,
      purpose,
      remarks,
      firstName,
      middleName,
      lastName,
      address1,
      address2,
      city,
      province,
      postalCode,
    }))
    .then(result => resolve(result))
    .catch(err => reject(err));
  }); 
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  if (validatorError.isEmpty()) {
    const {body} = req;
    newPoliceClearanceCertifications(body)
    .then(result => {
      console.log(result);
      resJSON.default(OK, {data: result}, res);
    })
    .catch(err => {
      console.log(err);
      resJSON.errorServer({error: err.message}, res);
    });
  } else {
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
};