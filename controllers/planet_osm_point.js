const planet_osm_point = require('../models').planet_osm_point;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var hstore = require('pg-hstore')();
var source = { "addr:city": "Roma"};

//var store = hstore("add:city", "Roma");


module.exports = {
    create(req, res) {
        return planet_osm_point
            .create({
           //     osm_id: req.body.osm_id,
                name: req.body.name,
                tags: req.body.tags,
                way: req.body.way
            })
            .then(point => res.status(200).send(point))
            .catch(error => res.status(400).send(error));
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