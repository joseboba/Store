'use strict';

//IMPORTS
var express = require('express');
var mdAuth = require('../middlewares/authenticated');
var categoryController = require('../controllers/category.controller');

var api = express.Router();

api.post('/createCategory/:idA',mdAuth.ensureAuth,categoryController.createCategory);
api.put('/updateCategory/:idA/:idC',mdAuth.ensureAuth, categoryController.updateCategory);
api.delete('/deleteCategory/:idA/:idC',mdAuth.ensureAuth, categoryController.deleteCategory);

module.exports = api;