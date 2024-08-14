const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const doctorController = require("../../controller/doctor/doctor.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});

route.post("/login", checkAccess(), doctorController.login);
route.get("/profile", checkAccess(), doctorController.getDoctorDetails);

route.patch("/updateTime", checkAccess(), doctorController.updateTime);
route.patch(
  "/updateProfile",
  checkAccess(),
  upload.single("image"),
  doctorController.updateProfile
);
route.patch(
  "/updateBankDetails",
  checkAccess(),
  upload.single("image"),
  doctorController.updateBankDetails
);

module.exports = route;
