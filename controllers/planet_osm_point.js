const planet_osm_point = require('../models').planet_osm_point;

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
        return planet_osm_point
            .all()
            .then(points => res.status(200).send(points))
            .catch(error => res.status(400).send(error));
    }
};