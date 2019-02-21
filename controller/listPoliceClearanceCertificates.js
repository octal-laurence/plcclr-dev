const {validationResult} = require('express-validator/check');
const {OK} = require('http-status-codes');

const DB = require('../model/plcclr');
const resJSON = require('../http/resJSON');

function listRecords({
  pgSkip,
  pgLimit
}) {
  return new Promise((resolve, reject) => {
    const plcclr = new DB.Plcclr();
    plcclr.certificates()
    .listRecords({}, pgSkip, pgLimit)
    .then(result => {
      const reMapResult = result.reduce((list, {
        plcclrId,
        applicantId,
        certificationEntry,
        applicantData,
        ...others
      }) => ((plcclrId && applicantId) ? 
              [ ...list,
                { ...others,
                  '@rid': others['@rid'].split("#")[1],
                  plcclrId: plcclrId[0].split("#")[1],
                  applicantId: applicantId[0].split("#")[1],
                  certificationEntry: certificationEntry[0],
                  applicantData: applicantData[0]
                }
              ] : list),
      []);

      resolve(reMapResult);
    })
    .catch(err => reject(err));
  });
}

module.exports = (req, res, next) => {
  const validatorError = validationResult(req);
  const {body} = req;

  if (validatorError.isEmpty()) {
    listRecords(body)
    .then(result => {
      console.log('success');
      resJSON.default(OK, { data: result }, res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.message);
      console.log('error');
      resJSON.errorServer({ error: err.message }, res);
    });
  } else {
    resJSON.errorInput({ error: validatorError.mapped() }, res);
  }
}