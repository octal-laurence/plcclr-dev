const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const bluebird = require('bluebird');
const fsExtra = require('fs-extra');

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
  applicantSignature,
  applicantFingerPrint,
}) {
  const plcclr = new DB.Plcclr();
  let clearanceCertification;

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
      applicantSignature,
      applicantFingerPrint,
    })
    .then(({certification, applicant}) => {
      clearanceCertification = {certification, applicant};
      const applicantID = applicant.toString().split("#")[1].replace(':', '-');
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

const plcclr = new DB.Plcclr();
plcclr
.policeClearanceCertifications()
.deleteRecord(`#12:188`)
.then(result => {
  console.log(result);
  console.log('success');
})
.catch(err => {
  console.log(err);
  console.log(err.message);
  console.log('error');
})