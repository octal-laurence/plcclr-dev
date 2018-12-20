const express = require('express');
const router = express.Router();

// controller
const controllerNewPoliceClrCertifications = require('../controller/newPoliceClearanceCertifications');
const controllerListPoliceClrCertifications = require('../controller/listPoliceClearanceCertifications');
const controllerGetPoliceClrCertification = require('../controller/getPoliceClearanceCertification');
const controllerGrantPoliceClrCertification = require('../controller/grantPoliceClearanceCertification');

// validators
const validatorPoliceClrCertifications = require('../http/validators/policeClearanceCertifications');

router.post('/new', validatorPoliceClrCertifications.create(), controllerNewPoliceClrCertifications);
router.post('/list', validatorPoliceClrCertifications.list(), controllerListPoliceClrCertifications);
router.post('/getRecord', validatorPoliceClrCertifications.getRecord(), controllerGetPoliceClrCertification);
router.post('/grantCertificate', validatorPoliceClrCertifications.grantCertificate(), controllerGrantPoliceClrCertification);

// FOR TESTING MUST REMOVE SOON
router.post('/testpush', (req, res, next) => {
  const {body} = req;
  console.log(body);

  res.json({
    status: 'success',
    data: [],
  });
});

module.exports = router;