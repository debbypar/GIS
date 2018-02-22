'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('point', {
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
            place: {
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
            way: {
                type: Sequelize.STRING
            },
            lon: {
                type: Sequelize.STRING
            },
            lat: {
                type: Sequelize.STRING
            }
        });
    },
    down: (queryInterface /*Sequelize*/) => {
        return queryInterface.dropTable('point');
    }
};