module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable('Todos', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            }
        }),
    down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Todos'),
};