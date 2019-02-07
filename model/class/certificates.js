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
    purpose,
    verifiedBy,
    certifiedBy,
    dateVerified,
    dateCertified,
    validity,
  }) {
    const certificationStatus = config.get('certificationStatus');
    const dateRecord = helper.dateMoment(new Date(), helper.dateFormat.orientdb);

    return new Promise((resolve, reject) => {
      this._db.commandBatch([`
        let certificates = INSERT INTO ${this._tbl} SET
        plcclrId = (select from ${plcclrId}),
        machineId = :machineId,
        station = :station,
        applicantId = (select from ${applicantId}),
        findings = :findings,
        purpose = :purpose,
        verifiedBy = ${JSON.stringify(verifiedBy)},
        certifiedBy = ${JSON.stringify(certifiedBy)},
        dateVerified = :dateVerified,
        dateCertified = :dateCertified,
        validity = :validity
      `, `
        let certificationEntry = UPDATE ${this._policeClearanceCertifications.tbl} SET 
        status = :status 
        WHERE @rid = ${plcclrId}
      `,`
        return $certificates
      `],
        { plcclrId,
          machineId,
          station,
          applicantId,
          findings,
          purpose,
          status: certificationStatus[`granted`],
          dateVerified: dateRecord,
          dateCertified: dateRecord,
          validity: dateRecord
        }
      )
      .then(({result}) => resolve(result))
      .catch(err => reject(err));
    });
  }
  getRecordOf(id) {
    return new Promise((resolve, reject) => {
      this._db.commandQuery(`
        SELECT plcclrId:{*} as certificationEntry, applicantId:{*} as applicantData, * FROM ${this._tbl} WHERE @rid = ${id}
      `)
      .then(({result}) => resolve(result))
      .catch(err => reject(err));
    });
  }
}

module.exports = { Certificates, tbl };

