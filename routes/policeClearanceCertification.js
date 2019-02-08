const express = require('express');
const router = express.Router();

// controller
const controllerNewPoliceClrCertifications = require('../controller/newPoliceClearanceCertifications');
const controllerEditPoliceClrCertifications = require('../controller/editPoliceClearanceCertifications');
const controllerDeletePoliceClrCertifications = require('../controller/deletePoliceClearanceCertifications');
const controllerListPoliceClrCertifications = require('../controller/listPoliceClearanceCertifications');
const controllerGetPoliceClrCertifications = require('../controller/getPoliceClearanceCertifications');
const controllerGrantPoliceClrCertifications = require('../controller/grantPoliceClearanceCertifications');
const controllerGetPoliceClrCertificates = require('../controller/getPoliceClearanceCertificates');

// validators
const validatorPoliceClrCertifications = require('../http/validators/policeClearanceCertifications');

router.post('/newApplicationEntry', validatorPoliceClrCertifications.newApplicationEntry(), controllerNewPoliceClrCertifications);
router.post('/editApplicationEntry', validatorPoliceClrCertifications.editApplicationEntry(), controllerEditPoliceClrCertifications);
router.post('/deleteApplicationEntry', validatorPoliceClrCertifications.deleteApplicationEntry(), controllerDeletePoliceClrCertifications);
router.post('/listApplicationEntries', validatorPoliceClrCertifications.listApplicationEntries(), controllerListPoliceClrCertifications);
router.post('/getApplicationEntry', validatorPoliceClrCertifications.getApplicationEntry(), controllerGetPoliceClrCertifications);

router.post('/grantCertificate', validatorPoliceClrCertifications.grantCertificate(), controllerGrantPoliceClrCertifications);
router.post('/getCertificate', validatorPoliceClrCertifications.getCertificate(), controllerGetPoliceClrCertificates);

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