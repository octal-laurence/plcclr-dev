const helper = require('../../helper/util');

const applicants = require('./applicants');
const address = require('./address');

// EDGES
const edgePoliceClearanceCertifications = require('../edges/policeClearanceCertificationApplicants');
const edgeApplicantsAddress = require('../edges/applicantsAddress');

const tbl = 'policeClearanceCertifications';
class PoliceClearanceCertifications {
  constructor(database) {
    this._db = database;
    this._tbl = tbl;

    this._address = address;
    this._applicants = applicants;

    this._edgePoliceClearanceCertifications = edgePoliceClearanceCertifications;
    this._edgeApplicantsAddress = edgeApplicantsAddress;
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
    const dateRecord = helper.dateMoment(new Date(), helper.dateFormat.orientdb);
    const leftThumb = applicantFingerPrint.leftThumb;
    const rightThumb = applicantFingerPrint.rightThumb;

    const parameters = {
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
    const commands = [`
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
    `, `
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
    `, `
      let address = INSERT INTO ${this._address.tbl} SET ${`
        applicantId = $applicants.@rid,
        address1 = :address1,
        address2 = :address2,
        barangay = :barangay,
        city = :city,
        province = :province,
        postalCode = :postalCode
      `.replace(/\n/g, '')}
    `, `
      let edgeCertificationApplicants = CREATE EDGE ${this._edgePoliceClearanceCertifications.tbl} FROM $applicants.@rid TO $certifications.@rid SET dateCreated = :dateCreated
    `, `
      let edgeApplicantsAddress = CREATE EDGE ${this._edgeApplicantsAddress.tbl} FROM $address.@rid TO $applicants.@rid
    `, `
      return [{"certification": $certifications.@rid}, {"applicant": $applicants.@rid}]
    `];

    return new Promise((resolve, reject) => {
      this._db.commandBatch(commands, parameters)
      .then(({result}) => {
        const [{value}] = result;
        resolve(value);
      })
      .catch(err => {
        reject(err);
      });
    });
  }
  getRecordOf(rid) {
    return new Promise((resolve, reject) => {
      this._db.commandQuery(`
        SELECT 
        IN('${this._edgePoliceClearanceCertifications.tbl}').toJson() as applicant, 
        IN('${this._edgePoliceClearanceCertifications.tbl}').IN('${this._edgeApplicantsAddress.tbl}').toJson() as address, 
        * FROM ${rid}
      `)
      .then(({result}) => {
        const [{applicant, address, ...certifications}] = result
        resolve([{
          applicant: JSON.parse(applicant),
          address: JSON.parse(address),
          ...certifications,
        }]);
      })
      .catch(err => {
        reject(err);
      });
    });
  }
  listRecords(filter={}, pgSkip=0, pgLimit=100) {
    return new Promise((resolve, reject) => {
      let queryFilter = '';
      let queryPaginator = '';

      // FILTERS
      const sqlSeperator = (sql='') => (sql !== '') ? `AND` : ``;
      if (filter.hasOwnProperty('status') && filter.status && filter.status != '') {
        queryFilter += ` status = '${filter.status}'`
      }
      if (filter.hasOwnProperty('dateCreated') && filter.dateCreated && filter.dateCreated != 'Invalid Date') {
        queryFilter += ` ${sqlSeperator(queryFilter)} dateCreated BETWEEN '${helper.dateMoment(new Date(filter.dateCreated), helper.dateFormat.orientdb)}' AND '${helper.dateMoment(new Date(), helper.dateFormat.orientdb)}'`;
      }
      if (filter.hasOwnProperty('fullName') && filter.fullName &&  filter.fullName != '') {
        queryFilter += ` ${sqlSeperator(queryFilter)} IN('${this._edgePoliceClearanceCertifications.tbl}')[0].fullName LIKE "%${filter.fullName}%"`
      }

      console.log(queryFilter);

      // PAGINATE
      if (pgSkip) {
        queryPaginator += `SKIP ${((pgLimit * pgSkip) - pgLimit)}`;
      }

      this._db.commandQuery(`
        SELECT IN('${this._edgePoliceClearanceCertifications.tbl}').toJson() as applicant, * FROM ${this._tbl}${(queryFilter != '') ? ` WHERE${queryFilter}` : ``} 
        ORDER BY dateCreated DESC 
        ${(queryPaginator != '') ? `${queryPaginator} LIMIT ${pgLimit}` : `LIMIT ${pgLimit}`} 
      `)
      .then(({result}) => {
        const list = result.map(certification => {
          const {applicant, ...entry} = certification;
          return {
            applicant: JSON.parse(applicant),
            ...entry
          }
        });
        resolve(list);
      })
      .catch(err => {
        reject(err);
      })
    });
  }
}

module.exports = {PoliceClearanceCertifications, tbl};