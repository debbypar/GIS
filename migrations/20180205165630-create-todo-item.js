'use strict';
module.exports = {
  up: function(queryInterface, Sequelize){
    return queryInterface.createTable('TodoItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.STRING
      },
      complete: {
        type: Sequelize.BOOLEAN
      }
    });
  },
  down: function(queryInterface/*, Sequelize*/){
    return queryInterface.dropTable('TodoItems');
  }
};