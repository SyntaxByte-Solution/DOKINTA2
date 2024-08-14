const express = require("express");
const route = express.Router();

const admin = require('../../middleware/admin');
const multer = require('multer');
const adminController = require('../../controller/admin/admin.controller')

const storage = require('../../middleware/multer');
const upload = multer({
    storage,
  });
  

  //get admin profile
route.get('/profile', admin, adminController.getProfile);

// admin login
route.post('/login', adminController.adminLogin);
route.post('/create', upload.single('image'), adminController.createAdmin);
route.patch('/update', admin, upload.single('image'), adminController.update);
route.put('/updatePassword', admin, adminController.updateAdminPassword);




module.exports = route;