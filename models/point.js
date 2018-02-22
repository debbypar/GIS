'use strict';
module.exports = (sequelize, DataTypes) => {
    const point = sequelize.define('point', {
//    osm_id: DataTypes.INTEGER,
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        boundary: DataTypes.STRING,
        interpolation: DataTypes.STRING,
        place: DataTypes.STRING,
        name: DataTypes.STRING,
        city: DataTypes.STRING,
        street: DataTypes.STRING,
        housenumber: DataTypes.STRING,
        way: DataTypes.STRING,
        lon: DataTypes.STRING,
        lat: DataTypes.STRING
    },  {
        timestamps: false
    });
    return point;
};