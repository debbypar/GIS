var express = require('express'),
    router = express.Router();
//const pointsController = require('../../controllers/index').points;
const addressesController = require('../../controllers/index').addresses;


router.get('/',function(req,res){
  res.render('address', { title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
});
/*router.post('/', function(req, res){
  console.log("+++++++++++++ "+ req.body.street);//JSON.stringify(req.body.street, null, 2));
    res.render('address', { city: req.body.city, street: req.body.street, housenumber: req.body.housenumber, title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
});*/

//router.post('/', pointsController.listQuery);
router.post('/', addressesController.listQuery);

module.exports = router;
