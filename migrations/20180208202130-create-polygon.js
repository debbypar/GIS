'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('polygon', {
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
            place: {
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
                type: Sequelize.REAL
            },
            way: {
                type: Sequelize.STRING
            }
        });
    },
    down: (queryInterface /*Sequelize*/) => {
        return queryInterface.dropTable('polygon');
    }
};