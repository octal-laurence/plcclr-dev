const helper = require('../../helper/util');

const applicants = require('./applicants');
const address = require('./address');

// EDGES
const edgePoliceClearanceCertifications = require('../edges/policeClearanceCertificationApplicants')

class PoliceClearanceCertifications {
  constructor(database) {
    this._db = database;
    this._tbl = 'policeClearanceCertifications';

    this._address = address;
    this._applicants = applicants;

    this._edgePoliceClearanceCertifications = edgePoliceClearanceCertifications;
  }
  newRecord({
    machineId,
    station,
    stationName,
    purpose,
    remarks = '',
    firstName,
    middleName,
    lastName,
    address1,
    address2 = '',
    city,
    province,
    postalCode,
  }) {
    return new Promise((resolve, reject) => {
      const dateRecord = helper.dateMoment(new Date(), helper.dateFormat.orientdb);
      this._db.query(`
        begin; 
        let certifications = INSERT INTO ${this._tbl} SET ${`
          machineId = :machineId,
          station = :station,
          purpose = :purpose,
          stationName = :stationName,
          remarks = :remarks,
          dateCreated = :dateCreated,
          dateUpdated = :dateUpdated,
          status = :status
        `.replace(/\n/g, '')}
        let applicants = INSERT INTO ${this._applicants.tbl} SET ${`
          plcclrId = $certifications.@rid,
          firstName = :firstName,
          middleName = :middleName,
          lastName = :lastName,
          fullName = :fullName 
        `.replace(/\n/g, '')}
        let address = INSERT INTO ${this._address.tbl} SET ${`
          applicantId = $applicants.@rid,
          address1 = :address1,
          address2 = :address2,
          city = :city,
          province = :province,
          postalCode = :postalCode
        `.replace(/\n/g, '')}
        let edgeCertificationApplicants = CREATE EDGE ${this._edgePoliceClearanceCertifications.tbl} FROM $applicants.@rid TO $certifications.@rid SET dateCreated = :dateCreated
        commit;

        return [{"certification": $certifications.@rid}, {"applicant": $applicants.@rid}]
      `, {
        class: 's',
        params: {
          // Certification Request
          machineId,
          station,
          purpose,
          stationName,
          remarks,
          ...{
            dateCreated: dateRecord,
            dateUpdated: dateRecord,
            status: 'OPEN'
          },

          // Applicant
          firstName,
          middleName,
          lastName,
          fullName: `${lastName} ${firstName} ${middleName}`,

          // Address
          address1,
          address2,
          city,
          province,
          postalCode,
        }
      })
      .then(newCert => {
        this._db.close();
        resolve(newCert);
      })
      .catch(err => {
        this._db.close();
        reject(err);
      });
    }); 
  }
  listRecords(filter={}, pgSkip=0, pgLimit=100) {
    return new Promise((resolve, reject) => {
      let queryFilter = '';
      let queryPaginator = '';

      // FILTERS
      if (filter.hasOwnProperty('dateCreated') && filter.dateCreated && filter.dateCreated != 'Invalid Date') {
        queryFilter += ` dateCreated BETWEEN '${helper.dateMoment(new Date(filter.dateCreated), helper.dateFormat.orientdb)}' AND '${helper.dateMoment(new Date(), helper.dateFormat.orientdb)}'`;
      }
      if (filter.hasOwnProperty('fullName') && filter.fullName &&  filter.fullName != '') {
        queryFilter += ` IN('${this._edgePoliceClearanceCertifications.tbl}')[0].fullName LIKE "%${filter.fullName}%"`
      }

      console.log(queryFilter);

      // PAGINATE
      if (pgSkip) {
        queryPaginator += `SKIP ${((pgLimit * pgSkip) - pgLimit)}`;
      }

      this._db.query(`
        SELECT IN('${this._edgePoliceClearanceCertifications.tbl}') as applicant, * FROM ${this._tbl}${(queryFilter != '') ? ` WHERE${queryFilter}` : ``} 
        ORDER BY dateCreated DESC 
        ${(queryPaginator != '') ? `${queryPaginator} LIMIT ${pgLimit}` : `LIMIT ${pgLimit}`} 
        FETCHPLAN *:1
      `)
      .then(result => {
        this._db.close();
        resolve(result);
      })
      .catch(err => {
        this._db.close();
        reject(err);
      })
    });
  }
  getRecordOf(rid) {
    return new Promise((resolve, reject) => {
      this._db.query(`
        SELECT IN('${this._edgePoliceClearanceCertifications.tbl}') as applicant, * FROM ${rid}
        FETCHPLAN *:1
      `)
      .then(result => {
        this._db.close();
        resolve(result);
      })
      .catch(err => {
        this._db.close();
        reject(err);
      });
    });
  }
}

exports.PoliceClearanceCertifications = PoliceClearanceCertifications;
exports.tbl = new PoliceClearanceCertifications()._tbl;