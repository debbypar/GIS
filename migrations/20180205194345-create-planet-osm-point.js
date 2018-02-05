'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('planet_osm_point', {
      name: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.HSTORE
      },
      way: {
        type: Sequelize.STRING
      }
    });
  },
  down: (queryInterface /*Sequelize*/) => {
    return queryInterface.dropTable('planet_osm_point');
  }
};