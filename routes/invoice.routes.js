'use strict';

var express = require('express');
var invoiceController = require('../controllers/invoice.controller');
var mdAut = require('../middlewares/authenticated');
var api = express.Router();


api.post('/createInvoice/:idA/:idU',mdAut.ensureAuth ,invoiceController.createInvoice);
api.get('/getInvoiceUser/:idA',mdAut.ensureAuth, invoiceController.getInvoiceUser);
api.get('/getInvoiceProduct/:idA/:idI', mdAut.ensureAuth, invoiceController.invoiceProduct);

module.exports = api;