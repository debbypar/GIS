//const planet_osm_point = require('../models').addresses;
const point = require('../models').point;
const line = require('../models').line;
const polygon = require('../models').polygon;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var math = require('mathjs');

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
                //TODO res.render(Via errata o non presente nel database).
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
                        else{
                            //TODO res.render coordinate del punto centrale.
                            console.log("Non c'è nulla in points, restituisco il punto centrale della via.\n");
                        }
                    });
                }
            }
        });
    });
//    console.log(linesInCityObj.length+"\n"+"òòòòòòòòòòòòòòòòòò");
//    return linesInCityObj;
}




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
            attributes: ['id', 'boundary', 'name', 'city', 'street', 'housenumber', 'way_area', 'way', [Sequelize.fn('ST_CENTROID', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'centroidL'], [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'lin'], [Sequelize.fn('ST_INTERSECTS', Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326))), Sequelize.fn('ST_GEOMFROMTEXT', objPol.dataValues.pol)), 'intersL']],
            where: {
                [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
            }
        });
}

function queryStreetInPoints(obj, objPol) {
    return point
        .findAll({
            attributes: ['id', 'name', 'city', 'street', 'housenumber', 'way', 'lon', 'lat', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'lin'], [Sequelize.fn('ST_CONTAINS', Sequelize.fn('ST_GEOMFROMTEXT', objPol.dataValues.pol), Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)))), 'intersP']],
            where: {
                [Op.and]: [{
                    [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
                }, {
                    housenumber: {
                        [Op.not]: ''
                    }
                }]
            }
        });
}

/**
 * Questa funzione restituisce la strada più vicina al punto con housenumber più vicino a quello in input, più piccolo.
 **/
function queryPointsMinLine(extremes, obj) {
    return line.findOne({
        attributes: ['id', 'boundary', 'name', 'city', 'street', 'housenumber', 'way_area', 'way', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'linestring'], [Sequelize.fn('ST_DISTANCE', Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326))), extremes.elements[0].lin), 'minLineDistance']],
        where: {
            [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
        },
        order: Sequelize.literal('"minLineDistance" ASC')
    });
}

/**
 * Questa funzione restituisce la strada più vicina al punto con housenumber più vicino a quello in input, più grande.
 **/
function queryPointsMaxLine(extremes, obj) {
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    console.log(extremes.elements[1].lin);
    return line.findOne({
        attributes: ['id', 'boundary', 'name', 'city', 'street', 'housenumber', 'way_area', 'way', [Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326)), 'linestring'], [Sequelize.fn('ST_DISTANCE', Sequelize.fn('ST_GEOMFROMTEXT', Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_TRANSFORM', Sequelize.col('way'), 4326))), extremes.elements[1].lin), 'maxLineDistance']],
        where: {
            [Op.or]: [{name: obj.nameStreet}, {street: obj.nameStreet}]
        },
        order: Sequelize.literal('"maxLineDistance" ASC')
    });
}


/**
 * Restituisce l'intersezione tra la posizione di un punto lungo una linea in percentuale.
 *
 * @param resultMinPoint - L'oggetto contenente la geometria per la line
 * @param extrObj   - L'oggetto contenente la geometria per il punto
 * @return {Promise<Model>}
 */
function minExtrPercentInLine(resultMinPoint, extrObj)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_LINE_LOCATE_POINT', resultMinPoint.dataValues.linestring, extrObj.elements[0].lin), 'minPercent']]
    });
}

/**
 * Restituisce l'intersezione tra la posizione di un punto lungo una linea in percentuale.
 *
 * @param resultMaxPoint - L'oggetto contenente la geometria per la line
 * @param extrObj   - L'oggetto contenente la geometria per il punto
 * @return {Promise<Model>}
 */
function maxExtrPercentInLine(resultMaxPoint, extrObj)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_LINE_LOCATE_POINT', resultMaxPoint.dataValues.linestring, extrObj.elements[1].lin), 'maxPercent']]
    });
}

function lineInterpolatePointMin(linestringObj, percent)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_LINE_INTERPOLATE_POINT', linestringObj.dataValues.linestring, percent)), 'minPointOnLine']]
    });
}

function lineInterpolatePointMax(linestringObj, percent)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_LINE_INTERPOLATE_POINT', linestringObj.dataValues.linestring, percent)), 'maxPointOnLine']]
    });
}



// This should work in node.js and other ES5 compliant implementations.
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}


function getLatLon(object) {
    console.log("---------------");

    var latLonObj = {};
//    console.log("INTERSEZIONE: " + pointsInCityObj[k].intersP + "....House Number: " + pointsInCityObj[k].housenumber + " ---lat " + pointsInCityObj[k].lat + " ---lon " + pointsInCityObj[k].lon);
    if(object.type === 'equal' || object.type === 'maxNear' || object.type === 'minNear')
    {
        latLonObj = {
            lat: object.element.lat,
            lon: object.element.lon,
        }
    }
    else if(object.type = 'extremes')
    {
       // console.log("Type")
        console.log(JSON.stringify(object));
    }
    console.log("---------------");
}

function choosePointsForHousenumber(points, myNumber) {
    var objects = [];
    var maxEl = points[0];
    var minEl = points[0];
    var maxNear = {};
    var minNear = {};
    var minBool = true;
    var maxBool = true;
    var equalBool = false;
    var objEq, objExtr = {};
    for(var i=0; i<points.length; i++)
    {
        if(parseInt(points[i].housenumber) === parseInt(myNumber))
        {
            equalBool = true;
            objEq = {
                type: 'equal',
                element: points[i]
            };
            return objEq;
        }
        else if(parseInt(points[i].housenumber) > parseInt(myNumber))
        {
            maxBool = false;
            if(!isEmptyObject(maxNear))
            {
                if(parseInt(points[i].housenumber) < parseInt(maxNear.housenumber))
                {
                    maxNear = {
                        type: 'maxNear',
                        element: points[i]
                    };
                }
                else if(parseInt(points[i].housenumber) > parseInt(maxEl.housenumber))
                {
                    maxEl = {
                        type: 'minNear',
                        element: points[i]
                    };
                }
            }
            else maxNear = points[i];
        }
        else if(parseInt(points[i].housenumber) < parseInt(myNumber))
        {
            minBool = false;
            if(!isEmptyObject(minNear))
            {
                if(parseInt(points[i].housenumber) > parseInt(minNear.housenumber))
                {
                    minNear = points[i];
                }
                else if(parseInt(points[i].housenumber) < parseInt(minEl.housenumber))
                {
                    minEl = points[i];
                }
            }
            else minNear = points[i];
        }
    }

    if(equalBool === true) return objEq;
    else if(maxBool === true) return minNear;
    else if(minBool === true) return maxNear;
    else if(maxBool === false && minBool === false)
    {
        objExtr = {
            type: 'extremes',
            elements: []
        };
        objExtr.elements.push(minNear);
        objExtr.elements.push(maxNear);
        return objExtr;
    }
}

module.exports = {
    listQuery(req, res) {

        var linesInCityObj = [];
        var pointsInCityObj = [];

        //TODO Controllare che l'house number che arriva sia fatto di soli numeri e parsarlo.

            var obj = {
                nameCity: req.body.city,
                nameStreet: req.body.street,
                housenumber: req.body.housenumber
            };

            queryCityInPolygon(obj).then(function (polygons) {
                if(polygons.length !== 0) {
                    //Prendo la geometria di area maggiore se presenti più geometrie per una stessa città (o paese).
                    var foundCity = getMaxWayAreaPol(polygons);

                    console.log("&&&&&&\n\n\n");
                    console.log(foundCity.dataValues.id);

                    queryStreetInLines(obj, foundCity).then(function (lines) {
                        console.log("Elementi trovati in lines per "+req.body.street+": " + lines.length);
                        if (lines.length === 0) {
                            console.log("Non ho trovato " + obj.nameStreet);

                            //Via errata o non presente nel database.
                            res.render('address', {
                                city: req.body.city,
                                street: req.body.street,
                                housenumber: req.body.housenumber,
                                subtitle: "Error in street "+req.body.street+"!!!"
                            });
                        }
                        else {
                            console.log("Ho trovato "+req.body.street+" in lines. Verifico l'intersezione con "+req.body.city+".\n");
                            for (var j = 0; j < lines.length; j++) {
                                console.log(j + ": " + lines[j].dataValues.intersL + "-------" + JSON.stringify(lines[j].dataValues.centroidL));
                                if (lines[j].dataValues.intersL) {
                                    linesInCityObj.push(lines[j].dataValues);
                                    console.log("lines con intersezione a true -------------> "+lines[j].dataValues.id);
                                }
                            }
                            console.log("Numero linee con inters a true: " + linesInCityObj.length);
                            if(linesInCityObj.length !== 0) {
                                //HO TROVATO STREET IN CITY, CERCARE IN POINTS
                                if(req.body.housenumber !== '' ) {
                                    queryStreetInPoints(obj, foundCity).then(function (points) {
                                        console.log("Cerco " + req.body.street + " con housenumber NOT NULL in points");
                                        console.log("Punti trovati: " + points.length);
                                        if (points.length !== 0) {
                                            //CERCO I PUNTI CON INTERSEZIONE CON LA CITTA' A TRUE;
                                            for (var z = 0; z < points.length; z++) {
                                                if (points[z].dataValues.intersP) {
                                                    pointsInCityObj.push(points[z].dataValues);
                                                }
                                            }
                                            console.log("In point c'è qualcosa per" + obj.nameStreet + " con housenumber NOT NULL. Quelli che intersecano la città inserita sono " + pointsInCityObj.length);
                                            if (pointsInCityObj.length === 0) {
                                                //HO TROVATO QUALCHE PUNTO IN POINTS CON HOUSENUMBER DIVERSO DA NULL, MA NESSUNO DI QUESTI INTERSECA LA CITTA' INSERITA.
                                                console.log("Non c'è intersezione da points, restituisco uno dei punti centrali della via.\n");
                                                res.render('address', {
                                                    lon: linesInCityObj[0].centroidL[0],
                                                    lat: linesInCityObj[0].centroidL[1],
                                                    city: req.body.city,
                                                    street: req.body.street,
                                                    housenumber: req.body.housenumber,
                                                    title: 'Addresses in Rome',
                                                    subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules'
                                                });
                                            }
                                            else if (pointsInCityObj.length === 1) {
                                                console.log("Un solo indirizzo per " + obj.nameStreet + " in points. INTERSEZIONE: " + pointsInCityObj[0].intersP + ".... Coordinate: " + pointsInCityObj[0].lat + "..." + pointsInCityObj[0].lon);
                                                res.render('address', {
                                                    lon: pointsInCityObj[0].lon,
                                                    lat: pointsInCityObj[0].lat,
                                                    city: req.body.city,
                                                    street: req.body.street,
                                                    housenumber: req.body.housenumber,
                                                    title: 'Addresses in Rome',
                                                    subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules'
                                                });
                                            }
                                            else {
                                                console.log("Più di un indirizzo con housenumber in point interseca la città.\n");
                                                //SCELGO GLI ELEMENTI IN POINTS PIU' VICINI AL NUMERO CIVICO INSERITO.
                                                var extrObj = choosePointsForHousenumber(pointsInCityObj, req.body.housenumber);
                                                console.log("oggetto: "+extrObj.type);
                                                    //TODO Avendo più punti, devo decidere quali lon e lat restituire.
                                                //getLatLon(extrObj);
                                                var latLonObj = {};
                                                if(extrObj.type === 'equal' || extrObj.type === 'maxNear' || extrObj.type === 'minNear')
                                                {
                                                    latLonObj = {
                                                        lat: extrObj.element.lat,
                                                        lon: extrObj.element.lon,
                                                    }
                                                }
                                                else if(extrObj.type = 'extremes')
                                                {
                                                    console.log("òòòòòòòòòòòòòòòòòòòòòòòòòòòòò");
                                                    console.log(JSON.stringify(extrObj.elements[0]));
                                                    queryPointsMinLine(extrObj, obj).then(function (resultMinPoint) {
                                                        console.log("£££££££££££££££££££££££££\n\n");
                                                        console.log(resultMinPoint);
                                                        queryPointsMaxLine(extrObj, obj).then(function (resultMaxPoint) {
                                                            console.log("!!!!!!!!!!!!!!!!!!!!!\n\n");
                                                            console.log(resultMaxPoint);
                                                            if(resultMinPoint.dataValues.id === resultMaxPoint.dataValues.id)
                                                            {
                                                                console.log("La line per gli estremi è la stessa!!!");
                                                                minExtrPercentInLine(resultMinPoint, extrObj).then(function (percentMin) {
                                                                    console.log("PERCENTUALE MIN:::::::::::\n");
                                                                    console.log(percentMin.dataValues.minPercent);
                                                                    maxExtrPercentInLine(resultMaxPoint, extrObj).then(function (percentMax) {
                                                                        console.log("PERCENTUALE MAX:::::::::::\n");
                                                                        console.log(percentMax.dataValues.maxPercent);
                                                                        //TODO INTERPOLATE (resultMinPoint (max è uguale, stessa linestring), percentMin.dataValues.minPercent)
                                                                        lineInterpolatePointMin(resultMinPoint,percentMin.dataValues.minPercent).then(function (minPointOnLine) {
                                                                            console.log("PUNTO DI MINIMO SULLA LINEA, COORDINATE:\n");
                                                                            console.log(minPointOnLine.dataValues.minPointOnLine);
                                                                            lineInterpolatePointMax(resultMinPoint,percentMax.dataValues.maxPercent).then(function (maxPointOnLine) {
                                                                                console.log("PUNTO DI MASSIMO SULLA LINEA, COORDINATE:\n");
                                                                                console.log(maxPointOnLine.dataValues.maxPointOnLine);
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                        })
                                                    });
                                                    latLonObj = {
                                                        lat: '41.8690322874759',
                                                        lon: '12.63069354943947',
                                                    }
                                                }

                                                res.render('address', {
                                                    lon: latLonObj.lon,
                                                    lat: latLonObj.lat,
                                                    city: req.body.city,
                                                    street: req.body.street,
                                                    housenumber: req.body.housenumber,
                                                    title: 'Addresses in Rome',
                                                    subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules'
                                                });

                                            }
                                        }
                                        else {
                                            //NON HO TROVATO ALCUN PUNTO CON HOUSENUMBER DIVERSO DA NULL.
                                            console.log("Non c'è nulla con housenumber in points, restituisco uno dei punti centrali della via.\n");
                                            console.log("Housenumber inserito: " + req.body.housenumber);

                                            //   console.log(linesInCityObj[0].centroidL.coordinates[0]+"*************"+linesInCityObj[0].centroidL.coordinates[1]);
                                            //    console.log(JSON.stringify(linesInCityObj[0]));
                                            //TODO Si può migliorare unendo tutte le parti delle vie che si toccano e da lì prendere il punto di intersezione.
                                            res.render('address', {
                                                lon: linesInCityObj[0].centroidL.coordinates[0],
                                                lat: linesInCityObj[0].centroidL.coordinates[1],
                                                city: req.body.city,
                                                street: req.body.street,
                                                housenumber: req.body.housenumber,
                                                title: 'Addresses in Rome',
                                                subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules'
                                            });
                                        }
                                    });
                                }
                                else {
                                    console.log("Non hai inserito l'house number, restituisci direttamente il centroide della via");
                                    res.render('address', {
                                        lon: linesInCityObj[0].centroidL.coordinates[0],
                                        lat: linesInCityObj[0].centroidL.coordinates[1],
                                        city: req.body.city,
                                        street: req.body.street,
                                        housenumber: req.body.housenumber,
                                        subtitle: "House number not inserted. This is the centroid of "+req.body.street+" in "+req.body.city+"!!!"
                                    });
                                }
                            }
                            else{
                                console.log("Via e Città esistenti ma nessuna intersezione tra "+req.body.city+" e "+req.body.street);
                                res.render('address', {
                                    city: req.body.city,
                                    street: req.body.street,
                                    housenumber: req.body.housenumber,
                                    subtitle: "There is no "+req.body.street+" in "+req.body.city+"!!!"
                                });
                            }
                        }
                    });
                }
                else{
                    res.render('address', {
                        city: req.body.city,
                        street: req.body.street,
                        housenumber: req.body.housenumber,
                        subtitle: req.body.city+" NOT FOUND!!!"
                    });
                }
            });

    },
};

/*queryIntersectStreetCity(object).then(function (points) {

//                    console.log("..."+points[0].dataValues.lon+"..."+points[0].dataValues.lat+"..."+req.body.city+"..."+req.body.street+"..."+req.body.housenumber);
                    res.render('address', {lon: '13.8975237757149'/*points.dataValues.lon*/ //, lat: '41.3944400645477'/*points.dataValues.lat*/, city: req.body.city, street: req.body.street, housenumber: req.body.housenumber, title: 'Addresses in Rome', subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules' });
/*})
.catch(error => res.status(400).send(error));*/