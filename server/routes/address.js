var express = require('express'),
    router = express.Router();

const addressesController = require('../../controllers/index').searchAddress;


router.get('/',function(req,res){
  res.render('address', { title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example.' });
});

router.post('/', addressesController.listQuery);

module.exports = router;
