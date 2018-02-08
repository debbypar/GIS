const planet_osm_point = require('../models').addresses;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    listQuery(req, res) {
            return planet_osm_point
                .findAll({
                    attributes: ['city', 'street', 'housenumber', 'lon', 'lat'],
                    where: {
                        [Op.and]: [{city: req.body.city}, {street: req.body.street}, {housenumber: req.body.housenumber}]
                    }
                })
                .then(points => {
                    console.log("////////\n");
                    console.log(points[0].dataValues);
                    console.log("fine /////\n");

//                    console.log("..."+points[0].dataValues.lon+"..."+points[0].dataValues.lat+"..."+req.body.city+"..."+req.body.street+"..."+req.body.housenumber);
                    res.render('address', {x: points[0].dataValues.lon, y: points[0].dataValues.lat, city: req.body.city, street: req.body.street, housenumber: req.body.housenumber, title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
                })
                .catch(error => res.status(400).send(error));
    },
};