const express = require("express");
const route = express.Router();
const multer = require("multer");
const storage = require("./../../middleware/multer");
const checkAccessWithSecretKey = require("../../middleware/checkAccess");
const bannerController = require("../../controller/admin/banner.controller");
const upload = multer({
  storage,
});

route.post(
  "/create",
  upload.single("image"),
  checkAccessWithSecretKey(),
  bannerController.create
);

route.get("/getAll", checkAccessWithSecretKey(), bannerController.getAll);

route.put(
  "/isActive",
  checkAccessWithSecretKey(),
  bannerController.isActive
);
route.delete(
  "/delete",
  checkAccessWithSecretKey(),
  bannerController.deleteBanner
);
module.exports = route;
