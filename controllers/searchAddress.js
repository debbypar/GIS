//const planet_osm_point = require('../models').addresses;
const point = require('../models').point;
const line = require('../models').line;
const polygon = require('../models').polygon;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var math = require('mathjs');


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
    })
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
    })
}

function lineInterpolatePointMin(linestringObj, percent)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_LINE_INTERPOLATE_POINT', linestringObj.dataValues.linestring, percent)), 'minPointOnLine']]
    });
}

function mergeLines(lineA, lineB)
{
    return line.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_MAKELINE', lineA, lineB)), 'linestring']]
    });
}

function lineInterpolatePoint(linestring, percent)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_LINE_INTERPOLATE_POINT', linestring, percent), 'point']]
    });
}

function lineInterpolatePointMax(linestringObj, percent)
{
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_LINE_INTERPOLATE_POINT', linestringObj.dataValues.linestring, percent)), 'maxPointOnLine']]
    });
}

/**
 *
 * @param linestringObj - L'oggetto contenente la sottostringa di una linestring data la posizione del punto iniziale (percentMin) e quella del punto finale (percentMax)
 * @param percentMin
 * @param percentMax
 * @return {Promise<Model>}
 */
function lineSubstringMinMax(linestringObj, percentMin, percentMax) {
    return point.findOne({
        attributes: ['id',[Sequelize.fn('ST_ASTEXT', Sequelize.fn('ST_LINE_SUBSTRING', linestringObj.dataValues.linestring, percentMin, percentMax)), 'substringMinMax']]
    });
}

/**
 * Determina se un oggetto è vuoto.
 * @param obj
 * @return {boolean}
 */
function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

/**
 * Calcola la posizione di un numero civico, rispetto al numero civico più piccolo più vicino e a quello più grande più vicino
 * @param numMin
 * @param numMax
 * @param myNum
 * @return {number}
 */
function houseNumberRatioPercent(numMin, numMax, myNum)
{
    console.log(numMin+"---------"+numMax+"-------"+myNum);
    return (myNum-numMin)/(numMax-numMin);
}

/**
 * Determina quali geometrie di punti con house number diverso da null possono essere usate per determinare la posizione del numero civico cercato.
 * @param points - i nodi che intersecano la via e la città inserita, con house number diverso da null.
 * @param myNumber - house number cercato.
 * @return {Obj} - Restituisce le geometrie da usare per il calcolo della posizione di un numero civico.
 */
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
                    maxNear = points[i];
                }
                else if(parseInt(points[i].housenumber) > parseInt(maxEl.housenumber))
                {
                    maxEl = points[i];
                }
            }
            else {
                maxNear = points[i];
            }
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
            else{
                minNear = points[i];
            }
        }
    }

    if(equalBool === true) return objEq;
    else if(maxBool === true){
        return {
            type: 'minNear',
            element: minNear
        }
    }
    else if(minBool === true){
        return{
            type: 'maxNear',
            element: maxNear
        }
    }
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

/**
 *  Racchiude tutte le query necessarie ad ottenere le coordinate del punto in input.
 * @type {{listQuery(*=, *=): void}}
 */
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
                                            console.log("In point c'è qualcosa per " + obj.nameStreet + " con housenumber NOT NULL. Quelli che intersecano la città inserita sono " + pointsInCityObj.length);
                                            if (pointsInCityObj.length === 0) {
                                                //HO TROVATO QUALCHE PUNTO IN POINTS CON HOUSENUMBER DIVERSO DA NULL, MA NESSUNO DI QUESTI INTERSECA LA CITTA' INSERITA.
                                                console.log("Non c'è intersezione con la città da points, restituisco uno dei centroidi della via.\n");
                                                res.render('address', {
                                                    lon: linesInCityObj[0].centroidL[0],
                                                    lat: linesInCityObj[0].centroidL[1],
                                                    city: req.body.city,
                                                    street: req.body.street,
                                                    housenumber: req.body.housenumber,
                                                    subtitle: 'No house number found. This one on the centroid of the street.'
                                                });
                                            }
                                            else if (pointsInCityObj.length === 1) {

                                                //C'è un solo numero civico nel db. Restituisco la geometria di questo.
                                                console.log("Un solo indirizzo per " + obj.nameStreet + " in points. INTERSEZIONE: " + pointsInCityObj[0].intersP + ".... Coordinate: " + pointsInCityObj[0].lat + "..." + pointsInCityObj[0].lon);
                                                res.render('address', {
                                                    lon: pointsInCityObj[0].lon,
                                                    lat: pointsInCityObj[0].lat,
                                                    city: req.body.city,
                                                    street: req.body.street,
                                                    housenumber: req.body.housenumber,
                                                    subtitle: 'A single one house number found!'
                                                });
                                            }
                                            else {
                                                //C'è più di un numero civico per l'indirizzo richiesto. Ricavo la posizione del numero richiesto da questi.
                                                console.log("Più di un indirizzo con housenumber in point interseca la città.\n");

                                                //SCELGO GLI ELEMENTI IN POINTS PIU' VICINI AL NUMERO CIVICO INSERITO.
                                                var extrObj = choosePointsForHousenumber(pointsInCityObj, req.body.housenumber);
                                                console.log("oggetto: "+extrObj.type);
                                                //Avendo più punti, devo decidere quali lon e lat restituire.
                                                if(extrObj.type === 'equal' || extrObj.type === 'maxNear' || extrObj.type === 'minNear')
                                                {
                                                    //Se trovo il matching esatto per il civico inserito, restituisco le sue coordinate. Se il numero in input è maggiore(minore) di ogni
                                                    //civico trovato pe quell'indirizzo, restituisco le coordinate del civico più grande (piccolo) per l'indirizzo.
                                                    res.render('address', {
                                                        lon: extrObj.element.lon,
                                                        lat: extrObj.element.lat,
                                                        city: req.body.city,
                                                        street: req.body.street,
                                                        housenumber: req.body.housenumber,
                                                        title: 'Addresses in Rome',
                                                        subtitle: 'Node.js / Google Maps Example with the help of the Express, Path, and Jade modules'
                                                    });

                                                }
                                                else if(extrObj.type = 'extremes')
                                                {
                                                    //Si verifica tale if quando trovo degli estremi (numero più vicino minore e numero più vicino maggiore) per l'indirizzo in input

                                                    console.log("òòòòòòòòòòòòòòòòòòòòòòòòòòòòò");
                                                    console.log(JSON.stringify(extrObj.elements[0]));
                                                    console.log(JSON.stringify(extrObj.elements[1]));

                                                    queryPointsMinLine(extrObj, obj).then(function (resultMinPoint) {
                                                        queryPointsMaxLine(extrObj, obj).then(function (resultMaxPoint) {
                                                            if(resultMinPoint.dataValues.id === resultMaxPoint.dataValues.id)
                                                            {
                                                                //I punti agli estremi si trovano sulla stessa line.
                                                                console.log("La line per gli estremi è la stessa!!!");
                                                                minExtrPercentInLine(resultMinPoint, extrObj).then(function (percentMin) {
                                                                    maxExtrPercentInLine(resultMaxPoint, extrObj).then(function (percentMax) {
                                                                        lineInterpolatePointMin(resultMinPoint,percentMin.dataValues.minPercent).then(function (minPointOnLine) {
                                                                            lineInterpolatePointMax(resultMinPoint,percentMax.dataValues.maxPercent).then(function (maxPointOnLine) {
                                                                                lineSubstringMinMax(resultMinPoint, percentMin.dataValues.minPercent, percentMax.dataValues.maxPercent).then(function (substring){
                                                                                    var percentNewPoint = houseNumberRatioPercent(extrObj.elements[0].housenumber, extrObj.elements[1].housenumber, req.body.housenumber);
                                                                                    lineInterpolatePoint(substring.dataValues.substringMinMax, percentNewPoint).then(function (finalResult) {
                                                                                        console.log("FINAL POINT:");
                                                                                        console.log(finalResult.dataValues.point);

                                                                                        res.render('address', {
                                                                                            lon: finalResult.dataValues.point.coordinates[0],
                                                                                            lat: finalResult.dataValues.point.coordinates[1],
                                                                                            city: req.body.city,
                                                                                            street: req.body.street,
                                                                                            housenumber: req.body.housenumber,
                                                                                            title: 'Addresses',
                                                                                            subtitle: 'Address found!!!!!'
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                            else
                                                            {
                                                                //Il civico maggiore e quello minore si trovano su due linee differenti. Le unisco tramite punti che toccano entramve le linee.
                                                                mergeLines(resultMinPoint.dataValues.linestring, resultMaxPoint.dataValues.linestring).then(function (resultMerge) {
                                                                    minExtrPercentInLine(resultMerge, extrObj).then(function (percentMin) {
                                                                        maxExtrPercentInLine(resultMerge, extrObj).then(function (percentMax) {
                                                                            lineInterpolatePointMin(resultMerge,percentMin.dataValues.minPercent).then(function (minPointOnLine) {
                                                                                lineInterpolatePointMax(resultMerge,percentMax.dataValues.maxPercent).then(function (maxPointOnLine) {
                                                                                    lineSubstringMinMax(resultMerge, percentMin.dataValues.minPercent, percentMax.dataValues.maxPercent).then(function (substring){
                                                                                        var percentNewPoint = houseNumberRatioPercent(extrObj.elements[0].housenumber, extrObj.elements[1].housenumber, req.body.housenumber);
                                                                                        lineInterpolatePoint(substring.dataValues.substringMinMax, percentNewPoint).then(function (finalResult) {

                                                                                                res.render('address', {
                                                                                                lon: finalResult.dataValues.point.coordinates[0],
                                                                                                lat: finalResult.dataValues.point.coordinates[1],
                                                                                                city: req.body.city,
                                                                                                street: req.body.street,
                                                                                                housenumber: req.body.housenumber,
                                                                                                title: 'Addresses',
                                                                                                subtitle: 'Address found!!!!!'
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            }
                                                        })
                                                    });
                                                }
                                            }
                                        }
                                        else {
                                            //NON HO TROVATO ALCUN PUNTO CON HOUSENUMBER DIVERSO DA NULL.
                                            console.log("Non c'è nulla con housenumber in points, restituisco uno dei punti centrali della via.\n");

                                            res.render('address', {
                                                lon: linesInCityObj[0].centroidL.coordinates[0],
                                                lat: linesInCityObj[0].centroidL.coordinates[1],
                                                city: req.body.city,
                                                street: req.body.street,
                                                housenumber: req.body.housenumber,
                                                subtitle: 'Point based on centroid.'
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