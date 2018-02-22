'use strict';
module.exports = (sequelize, DataTypes) => {
    const polygon = sequelize.define('polygon', {
//    osm_id: DataTypes.INTEGER,
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        boundary: DataTypes.STRING,
        interpolation: DataTypes.STRING,
        name: DataTypes.STRING,
        place: DataTypes.STRING,
        city: DataTypes.STRING,
        street: DataTypes.STRING,
        housenumber: DataTypes.STRING,
        way_area: DataTypes.REAL,
        way: DataTypes.STRING
    },  {
        timestamps: false
    });
    return polygon;
};