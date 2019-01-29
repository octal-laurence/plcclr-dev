const { check, validationResult } = require('express-validator/check');

const custom = require('./custom');

exports.newApplicationEntry = req => {
  return [
    check('machineId')
    .exists()
    .isString(),

    check('station')
    .exists()
    .isString(),

    check('stationName')
    .exists()
    .isString(),

    check('purpose')
    .exists()
    .isString(),

    check('firstName')
    .exists()
    .isString(),

    check('middleName')
    .isString(),

    check('lastName')
    .exists()
    .isString(),

    check('address1')
    .exists()
    .isString(),

    check('address2')
    .isString(),

    check('city')
    .exists()
    .isString(),

    check('province')
    .exists()
    .isString(),

    check('postalCode')
    .exists()
    .isString()
  ];
}

exports.listApplicationEntries = req => {
  return [
    check('fullName')
    .custom(custom.isString),

    check('dateCreated')
    .custom(custom.isDate),

    check('pgSkip')
    .custom(custom.isInteger),

    check('pgLimit')
    .custom(custom.isInteger)
  ];
}

exports.getApplicationEntry = req => {
    return [
        check('id')
        .exists()
        .isString()
    ];
}

exports.grantCertificate = req => {
  return [
    check('plcclrId')
    .exists()
    .isString(),
    check('verifiedBy')
    .exists()
    .custom((input) => {
      if (input && (typeof input !== 'object')) {
        return false;
      }
      return true;
    })
    .custom((input) => {
      if (!input.hasOwnProperty('id')) {
        return false
      }
      if (!input.hasOwnProperty('name')) {
        return false
      }
      if (!input.hasOwnProperty('title')) {
        return false
      }
      return true;
    }),
    check('certifiedBy')
    .exists()
    .custom((input) => {
      if (input && (typeof input !== 'object')) {
        return false;
      }
      return true;
    })
    .custom((input) => {
      if (!input.hasOwnProperty('id')) {
        return false
      }
      if (!input.hasOwnProperty('name')) {
        return false
      }
      if (!input.hasOwnProperty('title')) {
        return false
      }
      return true;
    })
  ];
}