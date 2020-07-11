'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    email: String,
    username: String,
    password: String,
    phone: String,
    role: String,
    direction: String,
    nit: String,
    invoice: [{type: Schema.Types.ObjectId, ref:'invoice'}],
    troley: [{type: Schema.Types.ObjectId, ref:'product'}]
});

module.exports = mongoose.model('user', userSchema);