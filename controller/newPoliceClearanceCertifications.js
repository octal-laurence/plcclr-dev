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

      // to modify
      applicantFingerPrint: {
        leftThumb: '',
        rightThumb: '',
      },
    })
    .then(([{certification}, {applicant}]) => {
      const [ridCertification] = certification;
      const [ridApplicant] = applicant;

      clearanceCertification = [{certification: {'@rid': ridCertification}}, {applicant: {'@rid': ridApplicant}}];
      const applicantID = ridApplicant.toString().split("#")[1].replace(':', '-');
      const fingerPrints = Object.entries(applicantFingerPrint)
                            .map(([k, v]) => ({
                              applicant: applicantID,
                              thumb: k,
                              base64: v,
                            }));

      return bluebird.map(fingerPrints, writeFingerPrintImage);
    })
    .then(result => resolve(clearanceCertification))
    .catch(err => reject(err));
  }); 
}

function writeFingerPrintImage({applicant, thumb, base64}) {
  return new Promise((resolve, reject) => {
    const fileName = `${thumb}.png`;
    const path = `./public/fingerPrints/${applicant}`;

    fsExtra.outputFile(`${path}/${fileName}`, new Buffer(base64, 'base64'), (err) => {
      if (!err) {
        resolve(applicant);
      } else {
        reject(err);
      }
    });
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
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
};