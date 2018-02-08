'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('addresses', {
            city: {
                type: Sequelize.STRING
            },
            street: {
                type: Sequelize.STRING
            },
            housenumber: {
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
        return queryInterface.dropTable('addresses');
    }
};