'use strict';
module.exports = function(sequelize, DataTypes){
    const Todo = sequelize.define('Todo', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
            timestamps: false
        });

    Todo.associate = function(models){
        Todo.hasMany(models.TodoItem, {
            foreignKey: 'todoId',
            as: 'todoItems',
        });
    };

    return Todo;
};
