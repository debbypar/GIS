const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
var path = require('path');
var jade = require('jade');
var address = require("./server/routes/address");

var app = new express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/address', address);

app.get('/',function(req,res){
    res.render('layout', { title: 'Node.js / Google Maps Example', subtitle: '' });
});

module.exports = app;