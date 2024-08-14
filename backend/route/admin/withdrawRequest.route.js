const express = require("express");
const route = express.Router();


const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const requestController = require('../../controller/admin/withdrawRequest.controller')


route.get("/getAll",checkAccessWithSecretKey(),requestController.getAll)


route.patch("/pay",checkAccessWithSecretKey(),requestController.pay)

route.patch("/decline",checkAccessWithSecretKey(),requestController.decline)

module.exports = route;
