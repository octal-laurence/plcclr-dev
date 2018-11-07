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
  address1,
  address2,
  city,
  province,
  postalCode,
  applicantIDPhoto,
  applicantSignature,
  applicantFingerPrint,
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
      applicantIDPhoto,
      applicantSignature,
      applicantFingerPrint: {
        leftThumb: '',
        rightThumb: '',
      },
    }))
    .then(result => {
      const applicantOwner = `${firstName}${new Date().getTime().toString()}`;
      const fingerPrints = Object.entries(applicantFingerPrint)
                            .map(([k, v]) => ({
                              applicant: applicantOwner,
                              thumb: k,
                              base64: v,
                            }));

      return bluebird.map(fingerPrints, writeFingerPrintImage);
    })
    .then(result => resolve(result))
    .catch(err => reject(err));
  }); 
}

function writeFingerPrintImage({applicant, thumb, base64}) {
  return new Promise((resolve, reject) => {
    const fileName = `${new Date().getTime().toString()}${thumb}.png`;
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
      console.log(result);
      console.log('success');
      resJSON.default(OK, {data: result}, res);
    })
    .catch(err => {
      console.log(err);
      console.log('error');
      resJSON.errorServer({error: err.message}, res);
    });
  } else {
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
};