const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');

const doctorWalletController = require('../../controller/admin/doctorWallet.controller')
const checkAccess = require("../../middleware/checkAccess");


route.get('/', checkAccess(), doctorWalletController.getWalletHistory);


module.exports = route;