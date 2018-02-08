'use strict';
module.exports = (sequelize, DataTypes) => {
    const addresses = sequelize.define('addresses', {
//    osm_id: DataTypes.INTEGER,
        city: DataTypes.STRING,
        street: DataTypes.STRING,
        housenumber: DataTypes.STRING,
        lon: DataTypes.STRING,
        lat:DataTypes.STRING
    },  {
        timestamps: false
    });
    /*
        planet_osm_point.associate = (models) => {
            planet_osm_point.hasMany(models.TodoItem, {
                foreignKey: 'osm_id',
                as: 'osm_id',
            });
        };*/

    return addresses;
};