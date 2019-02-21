const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const fs = require('fs');
const bluebird = require('bluebird');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');
const helper = require('../helper/util');

function getPoliceClrCertification(id) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();

    plcclr.policeClearanceCertifications()
    .getRecordOf(id)
    .then(getFingerPrintImages)
    .then(constructCertificationData)
    .then(certificationsEntry => resolve(certificationsEntry))
    .catch(err => reject(err));
  });
}

function getFingerPrintImages([entry]) {
  return new Promise((resolve, reject) => {
    const [applicantFingerPrints] = entry.applicantFingerPrints;
    const reMapApplicantFingerPrints = Object.entries(applicantFingerPrints)
                                       .filter(([k, v]) => (k.indexOf('rightThumb') > -1 || k.indexOf('leftThumb') > -1))
                                       .reduce((obj, [k,v]) => {
                                          if (k.indexOf('rightThumb') > -1) {
                                            return {
                                              ...obj,
                                              rightThumb: {
                                                ...obj.rightThumb,
                                                [k.replace('rightThumbG', '')]: v
                                              }
                                            }
                                          }
                                          if (k.indexOf('leftThumb') > -1) {
                                            return {
                                              ...obj,
                                              leftThumb: {
                                                ...obj.leftThumb,
                                                [k.replace('leftThumbG', '')]: v
                                              }
                                            }
                                          }
                                          return obj;
                                       }, {});

    const buildDataURI = Object.entries(reMapApplicantFingerPrints)
                         .map(([k, v]) => ({
                              label: k,
                              dataURI: Object.entries(v)
                                       .reduce((text, [chunkName, chunkVal]) => (`${text}${chunkVal}`), ``)
                          }));
 
    resolve([entry, buildDataURI]);
  });
}

function constructCertificationData([entry, fingerPrints =[]]) {
  const plcclrCertification = {
    '@rid': entry['@rid'].toString().split('#')[1],
    machineId: entry.machineId,
    station: entry.station,
    stationName: entry.stationName,
    dateCreated: entry.dateCreated,
    dateUpdated: entry.dateUpdated,
    purpose: entry.purpose,
    remarks: entry.remarks,
    status: entry.status
  };

  const [dataApplicant] = entry.applicant;
  const applicant = {
    '@rid': dataApplicant && dataApplicant['@rid'].toString().split('#')[1],
    fullName: dataApplicant && dataApplicant.fullName,
    firstName: dataApplicant && dataApplicant.firstName,
    lastName: dataApplicant && dataApplicant.lastName,
    middleName: dataApplicant && dataApplicant.middleName,
    suffix: dataApplicant && dataApplicant.suffix,
    gender: dataApplicant && dataApplicant.gender,
    civilStatus: dataApplicant && dataApplicant.civilStatus,
    citizenship: dataApplicant && dataApplicant.citizenship,
    dateBirth: dataApplicant && helper.dateMoment(dataApplicant.dateBirth, helper.dateFormat.MDY),
    birthPlace: dataApplicant && dataApplicant.birthPlace,
    religion: dataApplicant && dataApplicant.religion,
    height: dataApplicant && dataApplicant.height,
    weight: dataApplicant && dataApplicant.weight,
    applicantIDPhoto: dataApplicant && dataApplicant.applicantIDPhoto,
    applicantSignature: dataApplicant && dataApplicant.applicantSignature,
    occupation: dataApplicant && dataApplicant.occupation,
    contactNumber: dataApplicant && dataApplicant.contactNumber,
    certResidency: dataApplicant && dataApplicant.certResidency,
    certResidencyIssuedAt: dataApplicant && dataApplicant.certResidencyIssuedAt,
    ctcIssuedDate: dataApplicant && helper.dateMoment(dataApplicant.ctcIssuedDate, helper.dateFormat.MDY),
  };
  const address = {
    address1: dataApplicant && dataApplicant.address1,
    address2: dataApplicant && dataApplicant.address2,
    barangay: dataApplicant && dataApplicant.barangay,
    city: dataApplicant && dataApplicant.city,
    province: dataApplicant && dataApplicant.province,
    postalCode: dataApplicant && dataApplicant.postalCode
  };
  const applicantFingerPrints = fingerPrints.reduce((obj, item) => ({
                                  ...obj,
                                  [item.label]: item.dataURI
                                }), {});

  return {
    ...plcclrCertification,
    address: address,
    applicant: {
      ...applicant,
      applicantFingerPrints
    },
  };
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);

  if (validatorError.isEmpty()) {
    const {body} = req;

    getPoliceClrCertification(body.id)
    .then(result => {
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
}
