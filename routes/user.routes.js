"use strict";

var express = require("express");
var userController = require("../controllers/user.controller");
var mdAuth = require("../middlewares/authenticated");

var api = express.Router();

api.post("/login", userController.login);
api.post("/createAdmin", userController.createAdmin);
api.post("/createUser/:idA", mdAuth.ensureAuth, userController.createUser);
api.put("/updateUser/:idU", mdAuth.ensureAuth, userController.updateUser);
api.delete("/deleteUser/:idU", mdAuth.ensureAuth, userController.deleteUser);
api.post("/saveTroley/:idU", mdAuth.ensureAuth, userController.troley);

module.exports = api;
