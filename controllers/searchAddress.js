//const planet_osm_point = require('../models').addresses;
const point = require('../models').point;
const line = require('../models').line;
const polygon = require('../models').polygon;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var math = require('mathjs');

const linesInCityObj = [];



/*function queryCityStreet(obj) {
    return point
        .findAll({
            attributes: ['city', 'street', 'housenumber', 'lon', 'lat'],
            where: {
                [Op.and]: [{city: obj.city}, {street: obj.street}]
            }
        })
}

function queryCityStreetHouseNumber(obj) {
    return point
        .findOne({
        //     attributes: ['city', 'street', 'housenumber', 'lon', 'lat'],
        where: {
            [Op.and]: [{city: obj.city}, {street: obj.street}, {housenumber: obj.housenumber}]
        }
    })
}*/

function getMaxWayAreaPol(objectsArr) {
    var max = objectsArr[0];
    for(var i=1; i<objectsArr.length; i++)
    {
        if(objectsArr[i].dataValues.way_area > max.dataValues.way_area)
            max = objectsArr[i];
    }
    return max;
}

function queryCityInPolygon(obj) {
    return polygon
        .findAll({
            attributes: ['id', 'way_area', 'way', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'pol']/*, [Sequelize.fn('ST_ASGEOJSON',Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326))), 'pointsPol']*/],
            where: {
                [Op.and]: [{name: obj.nameCity},{boundary: 'administrative'}]
            }
        })
}

function queryStreetInLines(obj, objPol) {
//    console.log("Ecco;;;;;;;;;;;; "+objPol.dataValues.pol);
    return line
        .findAll({
            attributes: ['id', 'boundary', 'name', 'city', 'street', 'housenumber', 'way_area', 'way', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'lin'], [Sequelize.fn('ST_INTERSECTS', Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326))), Sequelize.fn('ST_GEOMFROMTEXT', objPol.dataValues.pol)), 'intersL']],
            where: {
                [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
            }
        });
}

function queryStreetInPoints(obj, objPol) {
//    console.log("Ecco;;;;;;;;;;;; "+objPol.dataValues.pol);
    return point
        .findAll({
            attributes: ['id', 'name', 'city', 'street', 'housenumber', 'way', 'lon', 'lat', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'lin'], [Sequelize.fn('ST_CONTAINS', Sequelize.fn('ST_GEOMFROMTEXT', objPol.dataValues.pol), Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)))), 'intersP']],
            where: {
                [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
            }
        });
}

function queryIntersectStreetCity(obj) {
    queryCityInPolygon(obj).then(function (polygons) {
        var foundCity = getMaxWayAreaPol(polygons);

        console.log("&&&&&&\n\n\n");
        console.log(foundCity.dataValues.id);

        queryStreetInLines(obj, foundCity).then(function (lines) {
            console.log("^^^ "+lines.length);
            if(lines === null)
            {
                console.log("Non ho trovato "+obj.nameStreet);
            }
            else
            {
                for(var j=0; j<lines.length; j++)
                {
                    if(lines[j].dataValues.intersL)
                    {
                        linesInCityObj.push(lines[j].dataValues);
                        console.log("lines trovate-------------\n");
                        console.log(lines[j].dataValues.id);
                    }
                }
                console.log("Numero linee: "+linesInCityObj.length);
                if(linesInCityObj.length !== 0)
                {
                    //HO TROVATO STREET IN CITY, CERCARE IN POINTS
                    console.log("Ho trovato le lineeeeeee\n");
                    queryStreetInPoints(obj, foundCity).then(function (points) {
                        console.log("LUNGHEZZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n");
                        console.log(points.length);
                        if(points.length !== 0)
                        {
                            //TODO Ho trovato qualcosa in points.........
                        }
                        else console.log("Non c'è nulla in points, restituisco il punto centrale della via.\n");
                    });
                }
            }
        });
    });
//    console.log(linesInCityObj.length+"\n"+"òòòòòòòòòòòòòòòòòò");
//    return linesInCityObj;
}



module.exports = {
    listQuery(req, res) {

        //TODO Controllare che l'house number che arriva sia fatto di soli numeri e parsarlo.

/*            var object = {
                city: req.body.city,
                street: req.body.street,
                housenumber: req.body.housenumber
            };
            queryCityStreetHouseNumber(object).then(function (points) {
*/
            var object = {
                nameCity: req.body.city,
                nameStreet: req.body.street,
                housenumber: req.body.housenumber
            };
            console.log("Ciaooooo");
   //         queryStreetInLines(object).then(function (points) {
            queryIntersectStreetCity(object)
            queryCityInPolygon(object).then(function (points) {
                    console.log("////////\n");
                    for(var i=0; i<points.length; i++)
                    {
                  //      console.log("...................."+points[i].dataValues.way_area);
                  //      console.log(points[i].dataValues.dumpP+'\n\n');

                    }
                    console.log("fine /////\n");

                    if(points === null)
                    {
                        var obj = {
                            city: req.body.city,
                            street: req.body.street
                        };
                        console.log("E' vuoto");
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                    /*    queryCityStreet(obj).then(function (result) {
                           console.log(result.length);
                       });*/
                       // queryResult(obj);
                    }
                    console.log("Finito??");
                    console.log("Lunghezza: "+points.length);

//                    console.log("..."+points[0].dataValues.lon+"..."+points[0].dataValues.lat+"..."+req.body.city+"..."+req.body.street+"..."+req.body.housenumber);
                    res.render('address', {lon: '13.8975237757149'/*points.dataValues.lon*/, lat: '41.3944400645477'/*points.dataValues.lat*/, city: req.body.city, street: req.body.street, housenumber: req.body.housenumber, title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
                })
                .catch(error => res.status(400).send(error));
    },
};