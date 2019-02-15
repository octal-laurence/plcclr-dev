const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const bluebird = require('bluebird');
const fsExtra = require('fs-extra');

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
  applicantSignature,
  applicantFingerPrint,
}) {
  const plcclr = new DB.Plcclr();
  let clearanceCertification;

  return new Promise((resolve, reject) => {
    plcclr
    .policeClearanceCertifications()
    .newRecord({
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
      applicantSignature,
      applicantFingerPrint
    })
    .then(([{certification}, {applicant}]) => {
      const [ridCertification] = certification;
      const [ridApplicant] = applicant;

      clearanceCertification = [{certification: {'@rid': ridCertification}}, {applicant: {'@rid': ridApplicant}}];
      return clearanceCertification;
    })
    .then(result => resolve(clearanceCertification))
    .catch(err => reject(err));
  }); 
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  if (validatorError.isEmpty()) {
    const {body} = req;

    newPoliceClearanceCertifications(body)
    .then(result => {
      console.log('success');
      resJSON.default(OK, {data: result}, res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
      console.log('error');
      resJSON.errorServer({error: err.message}, res);
    });
  } else {
    console.log(validatorError.mapped());
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
};