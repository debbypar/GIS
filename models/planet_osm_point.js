'use strict';
module.exports = (sequelize, DataTypes) => {
  const planet_osm_point = sequelize.define('planet_osm_point', {
//    osm_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    tags: DataTypes.HSTORE,
    way: DataTypes.STRING,
      "addr:housename": DataTypes.STRING,
      "addr:housenumber":DataTypes.STRING
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

  return planet_osm_point;
};