const express = require("express");
const route = express.Router();

const admin = require("../../middleware/admin");
const serviceController = require("../../controller/admin/service.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});

const checkAccess = require('../../middleware/checkAccess')


route.get("/",checkAccess(), serviceController.getAll);
route.post("/create", upload.single("image"), checkAccess(),serviceController.create);
route.patch("/update", upload.single("image"),checkAccess(), serviceController.update);
route.patch("/delete",checkAccess(), serviceController.delete);
route.patch("/status",checkAccess(), serviceController.handleStatus);
route.get('/getAllForDropdown', admin, serviceController.getAllForDropdown);

module.exports = route;
