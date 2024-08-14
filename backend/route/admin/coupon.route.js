const express = require("express");
const route = express.Router();

const checkAccess = require("../../middleware/checkAccess");
const couponController = require("../../controller/admin/coupon.controller");

route.post("/create",checkAccess(), couponController.create);
route.put("/active",checkAccess(), couponController.activeInactive);
route.delete("/delete", checkAccess(), couponController.delete);
route.get("/get", checkAccess(), couponController.getCoupon);



module.exports = route;
