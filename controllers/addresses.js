//const planet_osm_point = require('../models').addresses;
const node = require('../models').node;
const way = require('../models').way;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function queryCityStreet(obj) {
    return planet_osm_point
        .findAll({
            attributes: ['city', 'street', 'housenumber', 'lon', 'lat'],
            where: {
                [Op.and]: [{city: obj.city}, {street: obj.street}]
            }
        })
}

module.exports = {
    listQuery(req, res) {

        //TODO Controllare che l'house number che arriva sia fatto di soli numeri e parsarlo.


            return node
                .findOne({
               //     attributes: ['city', 'street', 'housenumber', 'lon', 'lat'],
                    where: {
                        [Op.and]: [{city: req.body.city}, {street: req.body.street}, {housenumber: req.body.housenumber}]
                    }
                })
                .then(points => {
                    console.log("////////\n");
                    console.log(points);
                    console.log("fine /////\n");

                    if(points === null)
                    {
                        var obj = {
                            city: req.body.city,
                            street: req.body.street
                        };
                        console.log("E' vuoto");
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                        queryCityStreet(obj).then(function (result) {
                           console.log(result.length);
                       });
                       // queryResult(obj);
                    }
                    console.log("Finito??");
                    //   else console.log("Lunghezza: "+points.length);

//                    console.log("..."+points[0].dataValues.lon+"..."+points[0].dataValues.lat+"..."+req.body.city+"..."+req.body.street+"..."+req.body.housenumber);
                    res.render('address', {lon: points.dataValues.lon, lat: points.dataValues.lat, city: req.body.city, street: req.body.street, housenumber: req.body.housenumber, title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
                })
                .catch(error => res.status(400).send(error));
    },
};