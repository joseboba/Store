'use stric';

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/createProduct/:idA',mdAuth.ensureAuth, mdAuth.ensureAuth ,productController.createProduct);
api.get('/getProduct',mdAuth.ensureAuth,  productController.getProducts);
api.get('/getPrice',mdAuth.ensureAuth,  productController.getPrice);
api.get('/searchProduct',mdAuth.ensureAuth,  productController.searchProduct);
api.get('/range',mdAuth.ensureAuth,  productController.range);
api.put('/updateProduct/:idA/:idP',mdAuth.ensureAuth, productController.updateProduct);
api.delete('/deleteProduct/:idA/:idP',mdAuth.ensureAuth,productController.removeProduct);
api.get('/exhausted' ,mdAuth.ensureAuth,productController.exhausted);
api.get('/moreBougth' ,mdAuth.ensureAuth,productController.moreBougth);

module.exports = api;