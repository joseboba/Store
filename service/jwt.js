'use strict';

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave';

exports.createToken = (user) =>{
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(1, 'week').unix()
    }
    return jwt.encode(payload, key);
}