const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function listPoliceClearanceCertifications({
  fullName,
  dateCreated,
  pgSkip,
  pgLimit,
}) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();

    plcclr.policeClearanceCertifications()
    .then(comm => comm.listRecords({
      fullName,
      dateCreated
    }, pgSkip, pgLimit))
    .then(constructCertificationList) 
    .then(certificationList => resolve(certificationList))
    .catch(err => reject(err));
  });
}

function constructCertificationList(list) {
  const plcclrCertifications = list.map((data) => {
    const certification = {
      '@rid': data['@rid'],
      machineId: data.machineId,
      dateCreated: data.dateCreated,
      purpose: data.purpose,
      station: data.station,
      stationName: data.stationName,
      remarks: data.remarks,
      dateUpdated: data.dateUpdated,
      status: data.status
    };

    const [dataApplicant] = data.applicant
    const applicant = {
      '@rid': dataApplicant && dataApplicant['@rid'],
      fullName: dataApplicant && dataApplicant.fullName,
      firstName: dataApplicant && dataApplicant.firstName,
      lastName: dataApplicant && dataApplicant.lastName,
      middleName: dataApplicant && dataApplicant.middleName,
    };

    return {
      ...certification,
      applicant: applicant,
    };
  });

  return plcclrCertifications;
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);

  if (validatorError.isEmpty()) {
    const {body} = req;
    listPoliceClearanceCertifications(body)
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
}