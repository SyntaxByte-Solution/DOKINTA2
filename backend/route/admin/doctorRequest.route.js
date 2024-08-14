const express = require("express");
const route = express.Router();

const admin = require("../../middleware/admin");
const requestController = require("../../controller/admin/doctorRequest.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const checkAccess = require('../../middleware/checkAccess')
const upload = multer({
    storage,
}) 

route.get("/", checkAccess(), requestController.getAll);

route.post('/accept', checkAccess(), requestController.acceptRequest);

route.post('/decline', checkAccess(), requestController.rejectRequest);

module.exports = route;
