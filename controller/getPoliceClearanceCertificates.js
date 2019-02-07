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
    const applicantId = certificate.applicantId.toString().split("#")[1].replace(':', '-');
    const path = `./public/fingerPrints/${applicantId}`;

    bluebird.map(['leftThumb', 'rightThumb'], (item) => {
      const fingerPrint = fs.readFileSync(`${path}/${item}.png`);
      return {
        dataURI: fingerPrint.toString('base64'),
        label: item,
      }
    })
    .then(result => resolve([certificate, result]))
    .catch(err => reject(err));
  });
}

function constructCertificationData([certificate, fingerPrints]) {
  const {certificationEntry, applicantData, ...cert } = certificate;
  const plcclrCertificate = {
    ...cert,
    "@rid": certificate['@rid'].toString().split('#')[1],  
    plcclrId: certificate.plcclrId.toString().split('#')[1],
    applicantId: certificate.applicantId.toString().split('#')[1],
  }

  const plcclrCertification = {
    "@rid": certificate.plcclrId.toString().split('#')[1],
    machineId: certificationEntry.machineId,
    station: certificationEntry.station,
    stationName: certificationEntry.stationName,
    dateCreated: certificationEntry.dateCreated,
    dateUpdated: certificationEntry.dateUpdated,
    purpose: certificationEntry.purpose,
    remarks: certificationEntry.remarks,
    status: certificationEntry.status
  };

  const applicant = {
    "@rid": certificate.applicantId.toString().split('#')[1],
    fullName: applicantData.fullName,
    firstName: applicantData.firstName,
    lastName: applicantData.lastName,
    middleName: applicantData.middleName,
    suffix: applicantData.suffix,
    gender: applicantData.gender,
    civilStatus: applicantData.civilStatus,
    citizenship: applicantData.citizenship,
    dateBirth: applicantData.dateBirth,
    birthPlace: applicantData.birthPlace,
    religion: applicantData.religion,
    height: applicantData.height,
    weight: applicantData.weight,
    applicantIDPhoto: applicantData.applicantIDPhoto,
    applicantSignature: applicantData.applicantSignature,
    address1: applicantData.address1 || '.',
    address2: applicantData.address2 || '.',
    barangay: applicantData.barangay || '.',
    city: applicantData.city || '.',
    province: applicantData.province || '.',
    postalCode: applicantData.postalCode || '.',
    occupation: applicantData.occupation || '.',
    contactNumber: applicantData.contactNumber || '.',
    certResidency: applicantData.certResidency || '.',
    certResidencyIssuedAt: applicantData.certResidencyIssuedAt || '.',
    ctcIssuedDate: applicantData.ctcIssuedDate,
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