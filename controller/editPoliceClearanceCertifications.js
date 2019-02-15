const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function editPoliceClearanceCertifications({
  id,
  machineId,
  station,
  stationName,
  purpose,
  remarks,

  firstName,
  middleName,
  lastName,
  suffix,
  gender,
  civilStatus,
  citizenship,
  dateBirth,
  birthPlace,
  religion,
  height,
  weight,
  contactNumber,
  occupation,
  certResidency,
  certResidencyIssuedAt,
  ctcIssuedDate,

  address1,
  address2,
  barangay,
  city,
  province,
  postalCode,

  applicantIDPhoto,
  applicantSignature
}) {
  const plcclr = new DB.Plcclr();

  return new Promise((resolve, reject) => {
    plcclr
    .policeClearanceCertifications()
    .updateRecord(id, {
      machineId,
      station,
      stationName,
      purpose,
      remarks,

      firstName,
      middleName,
      lastName,
      suffix,
      gender,
      civilStatus,
      citizenship,
      dateBirth,
      birthPlace,
      religion,
      height,
      weight,
      contactNumber,
      occupation,
      certResidency,
      certResidencyIssuedAt,
      ctcIssuedDate,

      address1,
      address2,
      barangay,
      city,
      province,
      postalCode,

      applicantIDPhoto,
      applicantSignature
    })
    .then(({certification, applicant}) => resovle({certification, applicant}))
    .catch(err => reject(err));
  });
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  const {body} = req;

  if (validatorError.isEmpty()) {

    editPoliceClearanceCertifications(body)
    .then(result => {
      console.log(result);
      console.log('success');
      resJSON.default(OK, { data: result }, res);
    })
    .catch(err => {
      console.log(err);
      console.log('error');
      resJSON.errorServer({error: err.message}, res);
    })
  } else {
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
}