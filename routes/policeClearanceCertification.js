const express = require('express');
const router = express.Router();

// controller
const controllerNewPoliceClrCertifications = require('../controller/newPoliceClearanceCertifications');
const controllerListPoliceClrCertifications = require('../controller/listPoliceClearanceCertifications');
const controllerGetPoliceClrCertifications = require('../controller/getPoliceClearanceCertification');

// validators
const validatorPoliceClrCertifications = require('../http/validators/policeClearanceCertifications');

router.post('/new', validatorPoliceClrCertifications.create(), controllerNewPoliceClrCertifications);
router.post('/list', validatorPoliceClrCertifications.list(), controllerListPoliceClrCertifications);
router.post('/getRecord', validatorPoliceClrCertifications.getRecord(), controllerGetPoliceClrCertifications);

module.exports = router;