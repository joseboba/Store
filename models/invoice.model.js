'use strict';

var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var invoiceSchema = Schema({
    fullName: String,
    direction: String,
    date: Date,
    product:[{
        products:[{type: Schema.Types.ObjectId, ref:'product'}],
        quantity: Number
    }],
    nit: String,
    total: Number
});

module.exports = mongoose.model('invoice', invoiceSchema);