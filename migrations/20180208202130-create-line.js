'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('line', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            boundary: {
                type: Sequelize.STRING
            },
            interpolation: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            city: {
                type: Sequelize.STRING
            },
            street: {
                type: Sequelize.STRING
            },
            housenumber: {
                type: Sequelize.INTEGER
            },
            way_area: {
                type: Sequelize.STRING
            },
            way: {
                type: Sequelize.STRING
            },
            linestring: {
                type: Sequelize.GEOMETRY
            }
        });
    },
    down: (queryInterface /*Sequelize*/) => {
        return queryInterface.dropTable('line');
    }
};