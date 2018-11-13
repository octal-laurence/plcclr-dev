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
    suffix,
    gender,
    civilStatus,
    citizenship,
    dateBirth,
    birthPlace,
    religion,
    height,
    weight,
    contactNumber,
    occupation,
    certResidency,
    certResidencyIssuedAt,
    ctcIssuedDate,

    address1,
    address2,
    barangay,
    city,
    province,
    postalCode,

    applicantIDPhoto,
    applicantSignature,
    applicantFingerPrint,
  }) {
    return new Promise((resolve, reject) => {
      const dateRecord = helper.dateMoment(new Date(), helper.dateFormat.orientdb);
      const leftThumb = applicantFingerPrint.leftThumb //.substring(1, 4);
      const rightThumb = applicantFingerPrint.rightThumb //.substring(1, 4);
      this._db.query(`
        begin; 
        let certifications = INSERT INTO ${this._tbl} SET ${`
          machineId = :machineId,
          station = :station,
          stationName = :stationName,
          dateCreated = :dateCreated,
          dateUpdated = :dateUpdated,
          purpose = :purpose,
          remarks = :remarks,
          status = :status
        `.replace(/\n/g, '')}
        let applicants = INSERT INTO ${this._applicants.tbl} SET ${`
          plcclrId = $certifications.@rid,
          firstName = :firstName,
          middleName = :middleName,
          lastName = :lastName,
          suffix = :suffix,
          fullName = :fullName,
          gender = :gender,
          civilStatus = :civilStatus,
          citizenship = :citizenship,
          dateBirth = :dateBirth,
          birthPlace = :birthPlace,
          religion = :religion,
          height = :height,
          weight = :weight,
          contactNumber = :contactNumber,
          occupation = :occupation,
          certResidency = :certResidency,
          certResidencyIssuedAt = :certResidencyIssuedAt,
          ctcIssuedDate = :ctcIssuedDate,
          applicantIDPhoto = :applicantIDPhoto,
          applicantSignature = :applicantSignature
        `.replace(/\n/g, '')}
        let address = INSERT INTO ${this._address.tbl} SET ${`
          applicantId = $applicants.@rid,
          address1 = :address1,
          address2 = :address2,
          barangay = :barangay,
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
          stationName,
          purpose,
          remarks,
          dateCreated: dateRecord,
          dateUpdated: dateRecord,
          status: 'OPEN',

          // Applicant
          firstName,
          middleName,
          lastName,
          suffix,
          fullName: `${lastName} ${firstName} ${middleName}`,
          gender,
          civilStatus,
          citizenship,
          dateBirth,
          birthPlace,
          religion,
          height,
          weight,
          contactNumber,
          occupation,
          certResidency,
          certResidencyIssuedAt,
          ctcIssuedDate,         
          applicantIDPhoto,
          applicantSignature,

          // Address
          address1,
          address2,
          barangay,
          city,
          province,
          postalCode
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