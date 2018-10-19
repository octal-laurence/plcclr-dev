const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function getPoliceClrCertification(id) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();

    plcclr.policeClearanceCertifications()
    .then(comm => comm.getRecordOf(id))
    .then(constructCertificationData)
    .then(certificationsEntry => resolve(certificationsEntry))
    .catch(err => reject(err));
  });
}

function constructCertificationData([entry]) {
  const plcclrCertification = {
    '@rid': entry['@rid'],
    machineId: entry.machineId,
    dateCreated: entry.dateCreated,
    purpose: entry.purpose,
    station: entry.station,
    stationName: entry.stationName,
    remarks: entry.remarks,
    dateUpdated: entry.dateUpdated,
    status: entry.status
  };

  const [dataApplicant] = entry.applicant
  const applicant = {
    '@rid': dataApplicant && dataApplicant['@rid'],
    fullName: dataApplicant && dataApplicant.fullName,
    firstName: dataApplicant && dataApplicant.firstName,
    lastName: dataApplicant && dataApplicant.lastName,
    middleName: dataApplicant && dataApplicant.middleName,
  };

  return {
    ...plcclrCertification,
    applicant: applicant,
  };
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);

  if (validatorError.isEmpty()) {
    const {body} = req;

    getPoliceClrCertification(body.id)
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
