class SamplePoliceClearanceCertification {
  constructor(database) {
    this._db = database;

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
    `];

    return new Promise((resolve, reject) => {
      this._db.commandBatch(commands, parameters)
      .then(({result}) => {
        resolve(result)
      })
      .catch(err => {
        reject(err);
      });
    });
  }
}