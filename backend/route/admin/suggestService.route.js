const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const suggestServiceController = require("../../controller/admin/suggestedService.controller");

const multer = require("multer");
const storage = require("../../middleware/multer");
const upload = multer({
  storage,
});
route.get("/", checkAccess(), suggestServiceController.getAll);
route.post("/accept", checkAccess(), upload.single('image'), suggestServiceController.accept);
route.delete("/decline", checkAccess(), suggestServiceController.decline);

module.exports = route;
