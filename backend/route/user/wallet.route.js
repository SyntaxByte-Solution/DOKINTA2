const express = require("express");
const route = express.Router();

const walletController = require("../../controller/user/wallet.controller");
const checkAccess = require('../../middleware/checkAccess')

route.get("/",checkAccess(), walletController.get);
route.post("/loadWallet", checkAccess(), walletController.loadWallet);
route.get("/getWalletHistory", checkAccess(), walletController.getWalletHistory);


module.exports = route;
