'use strict';
module.exports = (sequelize, DataTypes) => {
    const line = sequelize.define('line', {
//    osm_id: DataTypes.INTEGER,
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        boundary: DataTypes.STRING,
        interpolation: DataTypes.STRING,
        name: DataTypes.STRING,
        city: DataTypes.STRING,
        street: DataTypes.STRING,
        housenumber: DataTypes.STRING,
        way_area: DataTypes.STRING,
        way: DataTypes.STRING,
        linestring: DataTypes.GEOMETRY
    },  {
        timestamps: false
    });
    return line;
};