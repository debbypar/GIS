const todosController = require('../../controllers/index').todos;
const pointsController = require('../../controllers/index').points;

module.exports = (app) => {
    app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the Todos API!',
    }));

    app.post('/api/todos', todosController.create);
    app.get('/api/todos', todosController.list);
    app.get('/api/points', pointsController.list);
};