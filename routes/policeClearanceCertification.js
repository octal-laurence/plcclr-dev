const express = require('express');
const router = express.Router();

// controller
const controllerNewPoliceClrCertifications = require('../controller/newPoliceClearanceCertifications');
const controllerEditPoliceClrCertifications = require('../controller/editPoliceClearanceCertifications');
const controllerListPoliceClrCertifications = require('../controller/listPoliceClearanceCertifications');
const controllerGetPoliceClrCertification = require('../controller/getPoliceClearanceCertification');
const controllerGrantPoliceClrCertification = require('../controller/grantPoliceClearanceCertification');

// validators
const validatorPoliceClrCertifications = require('../http/validators/policeClearanceCertifications');

router.post('/newApplicationEntry', validatorPoliceClrCertifications.newApplicationEntry(), controllerNewPoliceClrCertifications);
router.post('/editApplicationEntry', validatorPoliceClrCertifications.editApplicationEntry(), controllerEditPoliceClrCertifications);
router.post('/listApplicationEntries', validatorPoliceClrCertifications.listApplicationEntries(), controllerListPoliceClrCertifications);
router.post('/getApplicationEntry', validatorPoliceClrCertifications.getApplicationEntry(), controllerGetPoliceClrCertification);
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