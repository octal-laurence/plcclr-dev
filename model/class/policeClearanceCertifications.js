const config = require('config');
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
     fullName: `${lastName} ${firstName} ${middleName} ${suffix}`,
     gender,
     civilStatus,
     citizenship,
     dateBirth: helper.dateMoment(new Date(dateBirth), helper.dateFormat.default),
     birthPlace,
     religion,
     height,
     weight,
     contactNumber,
     occupation,
     certResidency,
     certResidencyIssuedAt,
     ctcIssuedDate: helper.dateMoment(new Date(ctcIssuedDate), helper.dateFormat.default),         
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
        dateCreated = DATE(:dateCreated),
        dateUpdated = DATE(:dateUpdated),
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
        dateBirth = DATE(:dateBirth),
        birthPlace = :birthPlace,
        religion = :religion,
        height = :height,
        weight = :weight,
        contactNumber = :contactNumber,
        occupation = :occupation,
        certResidency = :certResidency,
        certResidencyIssuedAt = :certResidencyIssuedAt,
        ctcIssuedDate = DATE(:ctcIssuedDate),

        address1 = :address1,
        address2 = :address2,
        barangay = :barangay,
        city = :city,
        province = :province,
        postalCode = :postalCode,

        applicantIDPhoto = :applicantIDPhoto,
        applicantSignature = :applicantSignature
      `.replace(/\n/g, '')}
    `, `
      let edgeCertificationApplicants = CREATE EDGE ${this._edgePoliceClearanceCertifications.tbl} FROM $applicants.@rid TO $certifications.@rid SET dateCreated = :dateCreated
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
  deleteRecord(id) {
    const commands = [
        `
        let getEdgeCertificationsApplicants = SELECT EXPAND(IN('${this._edgePoliceClearanceCertifications.tbl}')) FROM ${this._tbl} WHERE @rid = ${id}
      `
      , `
        let delCertification = DELETE VERTEX FROM ${this._tbl} WHERE @rid = ${id}
      `
      , `
        let delApplicant = DELETE VERTEX FROM ${this._applicants.tbl} WHERE @rid IN $getEdgeCertificationsApplicants.@rid
      `
      ,`
        return $delApplicant
      `
    ];

    return this._db.commandBatch(commands);
  }
  updateRecord(id, {
    machineId,
    station,
    stationName,
    purpose,
    remarks,

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
    const commands = [`
      let certifications = UPDATE ${this._tbl} SET ${`
        machineId = :machineId,
        station = :station,
        stationName = :stationName,
        dateUpdated = :dateUpdated,
        purpose = :purpose,
        remarks = :remarks
      `.replace(/\n/g, '')} 
      WHERE @rid = ${id}
    `, `
      let getCertifications = SELECT EXPAND(IN('${this._edgePoliceClearanceCertifications.tbl}')) FROM ${this._tbl} WHERE @rid = ${id}
    `, `
      let applicants = UPDATE ${this._applicants.tbl} SET ${`
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
        applicantSignature = :applicantSignature,
        address1 = :address1,
        address2 = :address2,
        barangay = :barangay,
        city = :city,
        province = :province,
        postalCode = :postalCode
      `.replace(/\n/g, '')} 
      WHERE @rid in $getCertifications.@rid
    `, `
      return {certification: ${id}, applicant: $getCertifications[0].@rid}
    `];

    const parameters = {
      machineId,
      station,
      stationName,
      purpose,
      remarks,
      dateUpdated: dateRecord,
    
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
    };

    return new Promise((resolve, reject) => {
      this._db.commandBatch(commands, parameters)
      .then(({result}) => {
        const [{value}] = result
        resolve(value);
      })
      .catch(err => {
        reject(err);
      });
    });
  }
  updateStatus(id, status) {
    const certificationStatus = config.get('certificationStatus');
    
    return this._db.commandQuery(`
      UPDATE ${this._tbl} SET status = :status WHERE @rid = :id
    `, {
      id: id,
      status: certificationStatus[status] || certificationStatus[`open`],
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