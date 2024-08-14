const express = require("express");
const route = express.Router();

const admin = require("../../middleware/admin");
const doctorController = require("../../controller/admin/doctor.controller");
const multer = require("multer");
const storage = require("../../middleware/multer");
const checkAccess = require("../../middleware/checkAccess");

const upload = multer({
  storage,
});

route.get("/", checkAccess(), doctorController.getAllDoctors);
route.get(
  "/getDoctorDropDown",
  checkAccess(),
  doctorController.getDoctorDropDown
);

route.get("/profile", checkAccess(), doctorController.getDoctorDetails);

route.patch("/blockUnblock", checkAccess(), doctorController.blockUnblock);

route.patch("/delete", checkAccess(), doctorController.delete);

route.patch(
  "/updateProfile",
  checkAccess(),
  upload.single("image"),
  doctorController.updateProfile
);

module.exports = route;
