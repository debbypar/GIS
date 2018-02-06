const planet_osm_point = require('../models').planet_osm_point;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var hstore = require('pg-hstore')();
var source = { "addr:city": "Roma"};

//var store = hstore("add:city", "Roma");


module.exports = {
    listQuery(req, res) {
        var inputHStore = {"addr:city": req.body.city, "addr:street":req.body.street, "addr:housenumber": req.body.housenumber};
        var input = [];
        hstore.stringify(inputHStore, function (result) {
            for(var i=0; i<result.split(',').length; i++)
                input.push(result.split(',')[i]);
            for(i=0; i<input.length; i++)
                console.log(i+": "+input[i]);

            return planet_osm_point
                .findAll({
                    attributes: ['tags', 'way'],
                    where: {
                        tags: {
                            [Op.and]: {
                                [Op.contains]: input[0],
                                [Op.and]: {
                                    [Op.contains]: input[1],
                                    [Op.and]: {
                                        [Op.contains]: input[2],
                                    }
                                }
                            },
                        }
                    }
                })
                .then(points => {
                    console.log("////////\n");
                    console.log(points);
                    console.log("////////\n");
                    res.status(200).send(points[0].dataValues.way.coordinates);
                })
                .catch(error => res.status(400).send(error));
        });
    },
    list(req, res) {
        hstore.stringify(source, function (result) {
            return planet_osm_point
            .findAll({
                attributes: ['tags', 'way'],
                where: {
                    tags: {
                            [Op.contains]: result
                    }
                }
            })
            .then(points => {
                console.log("////////\n");
                console.log(points);
                console.log("////////\n");
                res.status(200).send(points)
            })
            .catch(error => res.status(400).send(error));
        });
    }
};