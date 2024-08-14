const express = require("express");
const route = express.Router();
const reviewController = require("../../controller/admin/review.controller");
const checkAccess = require("../../middleware/checkAccess");

route.get('/getAll', checkAccess(), reviewController.getAll);
route.get(
    "/doctorReview",
    checkAccess(),
    reviewController.doctorReview
  );
  
  route.delete(
    "/delete",
    checkAccess(),
    reviewController.delete
  );

module.exports = route;
