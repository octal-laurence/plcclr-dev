const config = require('config');
const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

const certificationStatus = config.get('certificationStatus');

function listPoliceClearanceCertifications({
  fullName,
  dateCreated,
  pgSkip,
  pgLimit,
}) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();
    plcclr.policeClearanceCertifications()
    .listRecords({
      fullName,
      dateCreated,
      status: certificationStatus.open,
    }, pgSkip, pgLimit)
    .then(constructCertificationList) 
    .then(certificationList => resolve(certificationList))
    .catch(err => reject(err));
  });
}

function constructCertificationList(list) {
  const plcclrCertifications = list.map((data) => {
    const inStringRID = data['@rid'].toString();
    const [,inViewRID] = inStringRID.split('#');

    const certification = {
      '@rid': inViewRID,
      machineId: data.machineId,
      dateCreated: data.dateCreated,
      dateUpdated: data.dateUpdated,
      station: data.station,
      stationName: data.stationName,
      purpose: data.purpose,
      remarks: data.remarks,
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