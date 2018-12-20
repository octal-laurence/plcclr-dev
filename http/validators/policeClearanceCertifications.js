const { check, validationResult } = require('express-validator/check');

const custom = require('./custom');

exports.create = req => {
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

exports.list = req => {
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

exports.getRecord = req => {
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
        .isString()
    ];
}