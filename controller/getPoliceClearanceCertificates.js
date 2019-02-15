const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const fs = require('fs');
const bluebird = require('bluebird');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function getPoliceClearanceCertificates(id) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();

    plcclr.certificates()
    .getRecordOf(id)
    .then(getFingerPrintImages)
    .then(constructCertificationData)
    .then(result => resolve(result))
    .catch(err => reject(err));
  });
}

function getFingerPrintImages([certificate]) {
  return new Promise((resolve, reject) => {
    const {applicantFingerPrints} = certificate;
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
 
    resolve([certificate, buildDataURI]);
  });
}

function constructCertificationData([certificate, fingerPrints=[]]) {
  const {certificationEntry, applicantData, ...cert } = certificate;
  const plcclrCertificate = {
    ...cert,
    "@rid": certificate['@rid'].toString().split('#')[1],  
    plcclrId: certificate.plcclrId.toString().split('#')[1],
    applicantId: certificate.applicantId.toString().split('#')[1],
  }

  const plcclrCertification = {
    "@rid": certificate.plcclrId.toString().split('#')[1],
    machineId: certificationEntry[0].machineId,
    station: certificationEntry[0].station,
    stationName: certificationEntry[0].stationName,
    dateCreated: certificationEntry[0].dateCreated,
    dateUpdated: certificationEntry[0].dateUpdated,
    purpose: certificationEntry[0].purpose,
    remarks: certificationEntry[0].remarks,
    status: certificationEntry[0].status
  };

  const applicant = {
    "@rid": certificate.applicantId.toString().split('#')[1],
    fullName: applicantData[0].fullName,
    firstName: applicantData[0].firstName,
    lastName: applicantData[0].lastName,
    middleName: applicantData[0].middleName,
    suffix: applicantData[0].suffix,
    gender: applicantData[0].gender,
    civilStatus: applicantData[0].civilStatus,
    citizenship: applicantData[0].citizenship,
    dateBirth: applicantData[0].dateBirth,
    birthPlace: applicantData[0].birthPlace,
    religion: applicantData[0].religion,
    height: applicantData[0].height,
    weight: applicantData[0].weight,
    applicantIDPhoto: applicantData[0].applicantIDPhoto,
    applicantSignature: applicantData[0].applicantSignature,
    addressComplete: (({address1,address2,barangay,city,province}) => {
      return `${address1} ${address2} ${barangay}, ${city} ${province}`
    })(applicantData[0]),
    address1: applicantData[0].address1 || '.',
    address2: applicantData[0].address2 || '.',
    barangay: applicantData[0].barangay || '.',
    city: applicantData[0].city || '.',
    province: applicantData[0].province || '.',
    postalCode: applicantData[0].postalCode || '.',
    occupation: applicantData[0].occupation || '.',
    contactNumber: applicantData[0].contactNumber || '.',
    certResidency: applicantData[0].certResidency || '.',
    certResidencyIssuedAt: applicantData[0].certResidencyIssuedAt || '.',
    ctcIssuedDate: applicantData[0].ctcIssuedDate,
  };
  const applicantFingerPrints = fingerPrints.reduce((obj, item) => {
                                  obj[item.label] = item.dataURI
                                  return obj;
                                }, {});

  return {
    ...plcclrCertificate,
    certificationEntry: plcclrCertification,
    applicant: {
      ...applicant,
      applicantFingerPrints
    }
  }
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);

  if (validatorError.isEmpty()) {
    const {body} = req;

    getPoliceClearanceCertificates(body.id)
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