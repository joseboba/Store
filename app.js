'use strict';

var express = require('express');
var bodyParser = require('body-parser');

//ROUTES
var categoryRoutes = require('./routes/category.routes');
var invoiceRoutes = require('./routes/invoice.routes');
var productRoutes = require('./routes/product.routes');
var userRoutes = require('./routes/user.routes');
 

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CONFIGURACION DE CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use('/category', categoryRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/product', productRoutes);
app.use('/user', userRoutes);

module.exports = app;