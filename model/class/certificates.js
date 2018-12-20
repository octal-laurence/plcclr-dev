const config = require('config');
const helper = require('../../helper/util');

const applicants = require('./applicants');
const policeClearanceCertifications = require('./policeClearanceCertifications');

// EDGES
const edgePoliceClearanceCertificationCertificates = require('../edges/policeClearanceCertificationCertificates');

const tbl = 'certificates';
class Certificates {
  constructor(database) {
    this._db = database;
    this._tbl = tbl;

    this._applicants = applicants;
    this._policeClearanceCertifications = policeClearanceCertifications;
  }
  grantCertificate({
    plcclrId,
    machineId,
    station,
    applicantId,
    findings,
    approvedBy,
    issuedBy,
    dateApproved,
    dateIssued,
    validity,
  }) {
    const certificationStatus = config.get('certificationStatus');
    const dateRecord = helper.dateMoment(new Date(), helper.dateFormat.orientdb);

    return this._db.commandBatch([`
      let certificates = INSERT INTO ${this._tbl} SET
      plcclrId = (select from ${plcclrId}),
      machineId = :machineId,
      station = :station,
      applicantId = (select from ${applicantId}),
      findings = :findings,
      approvedBy = :approvedBy,
      issuedBy = :issuedBy,
      dateApproved = :dateApproved,
      dateIssued = :dateIssued,
      validity = :validity
    `, `
      let certificationEntry = UPDATE ${this._policeClearanceCertifications.tbl} SET 
      status = :status 
      WHERE @rid = ${plcclrId}
    `,`
      return [{certificates: $certificates}]
    `], {
      plcclrId,
      machineId,
      station,
      applicantId,
      findings,
      approvedBy,
      issuedBy,
      status: certificationStatus[`granted`],
      dateApproved: dateRecord,
      dateIssued: dateRecord,
      validity: dateRecord,
    });
  }
}

module.exports = { Certificates, tbl };