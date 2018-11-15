const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');
const fs = require('fs');
const bluebird = require('bluebird');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function getPoliceClrCertification(id) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();

    plcclr.policeClearanceCertifications()
    .then(comm => comm.getRecordOf(id))
    .then(getFingerPrintImages)
    .then(constructCertificationData)
    .then(certificationsEntry => resolve(certificationsEntry))
    .catch(err => reject(err));
    // .then(data => {
    //   console.log(data[0][0]);
    //   return data;
    // })
  });
}

function getFingerPrintImages([entry]) {
  return new Promise((resolve, reject) => {
    const [applicant] = entry.applicant;
    const applicantId = applicant['@rid'].toString().split("#")[1].replace(':', '-');
    const path = `./public/fingerPrints/${applicantId}`;

    bluebird.map(['leftThumb', 'rightThumb'], (item) => {
      const fingerPrint = fs.readFileSync(`${path}/${item}.png`);
      return {
        dataURI: fingerPrint.toString('base64'),
        label: item,
      }
    })
    .then(result => resolve([entry, result]))
    .catch(err => reject(err));
  });
}

function constructCertificationData([entry, fingerPrints]) {
  const plcclrCertification = {
    '@rid': entry['@rid'],
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
    '@rid': dataApplicant && dataApplicant['@rid'],
    fullName: dataApplicant && dataApplicant.fullName,
    firstName: dataApplicant && dataApplicant.firstName,
    lastName: dataApplicant && dataApplicant.lastName,
    middleName: dataApplicant && dataApplicant.middleName,
    suffix: dataApplicant && dataApplicant.suffix,
    gender: dataApplicant && dataApplicant.gender,
    civilStatus: dataApplicant && dataApplicant.civilStatus,
    citizenship: dataApplicant && dataApplicant.citizenship,
    dateBirth: dataApplicant && dataApplicant.dateBirth,
    birthPlace: dataApplicant && dataApplicant.birthPlace,
    height: dataApplicant && dataApplicant.height,
    weight: dataApplicant && dataApplicant.weight,
    applicantIDPhoto: dataApplicant && dataApplicant.applicantIDPhoto,
    applicantSignature: dataApplicant && dataApplicant.applicantSignature,
  };
  const applicantFingerPrints = fingerPrints.reduce((obj, item) => {
                                  obj[item.label] = item.dataURI
                                  return obj;
                                }, {});

  const [dataAddress] = entry.address;
  const address = {
    address1: dataAddress && dataAddress.address1,
    address2: dataAddress && dataAddress.address2,
    barangay: dataAddress && dataAddress.barangay,
    city: dataAddress && dataAddress.city,
    province: dataAddress && dataAddress.province,
    postalCode: dataAddress && dataAddress.postalCode,
  }

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
      resJSON.default(OK, {data: result}, res);
    })
    .catch(err => {
      resJSON.errorServer({error: err.message}, res);
    });
  } else {
    resJSON.errorInput({error: validatorError.mapped()}, res);
  }
}
