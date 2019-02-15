const config = require('config');
const helper = require('../../helper/util');

const Applicants = require('./applicants');
const PoliceClearanceCertifications = require('./policeClearanceCertifications');
const FingerPrints = require('./fingerPrints');

// EDGES
const edgePoliceClearanceCertificationApplicants = require('../edges/policeClearanceCertificationApplicants');
const edgePoliceClearanceCertificationCertificates = require('../edges/policeClearanceCertificationCertificates');
const edgeApplicantsFingerPrints = require('../edges/applicantsFingerPrints');

const tbl = 'certificates';
class Certificates {
  constructor(database) {
    this._db = database;
    this._tbl = tbl;

    this._applicants = Applicants;
    this._policeClearanceCertifications = PoliceClearanceCertifications;
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
        machineId = :machineId,
        station = :station,
        plcclrId = (select from ${plcclrId}),
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
      `
      ,`
        CREATE EDGE  ${edgePoliceClearanceCertificationCertificates.tbl} FROM ${plcclrId} TO $certificates.@rid
      `
      ,`
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
        SELECT plcclrId:{*} as certificationEntry, applicantId:{*} as applicantData, 
        IN('${edgePoliceClearanceCertificationCertificates.tbl}').IN('${edgePoliceClearanceCertificationApplicants.tbl}').IN('${edgeApplicantsFingerPrints.tbl}')[0]:{*} as applicantFingerPrints,  
        * FROM ${this._tbl} WHERE @rid = ${id}
      `)
      .then(({result}) => resolve(result))
      .catch(err => reject(err));
    });
  }
  listRecords(filter={}, pgSkip=0, pgLimit=100) {
    let queryFilter = '';
    let queryPaginator = '';

    // PAGINATE
    if (pgSkip) {
      queryPaginator += `SKIP ${((pgLimit * pgSkip) - pgLimit)}`;
    }

    return new Promise((resolve, reject) => {
      this._db.commandQuery(`
        SELECT plcclrId:{*} as certificationEntry, applicantId:{fullName} as applicantData,* FROM ${this._tbl} 
        ORDER BY @rid DESC 
        ${(queryPaginator != '') ? `${queryPaginator} LIMIT ${pgLimit}` : `LIMIT ${pgLimit}`}
      `)
      .then(({result}) => resolve(result))
      .catch(err => reject(err));
    });
  }
}

module.exports = { Certificates, tbl };

